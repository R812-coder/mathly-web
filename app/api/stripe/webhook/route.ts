import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const runtime = "nodejs";
export const preferredRegion = "iad1";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

type SubInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];

async function upsertEntitlement(
  sb: SupabaseClient<Database>,
  userId: string,
  sub: Stripe.Subscription
) {
  const rec: SubInsert = {
    user_id: userId,
    stripe_customer_id:
      (typeof sub.customer === "string" ? sub.customer : sub.customer?.id) ?? null,
    stripe_subscription_id: sub.id,
    price_id: sub.items.data[0]?.price?.id ?? null,
    plan:
      typeof sub.items.data[0]?.price?.recurring?.interval === "string"
        ? (sub.items.data[0]!.price!.recurring!.interval as "month" | "year")
        : null,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
    is_pro: sub.status === "active" || sub.status === "trialing",
    updated_at: new Date().toISOString()
  };

  await sb.from("subscriptions").upsert(rec, { onConflict: "user_id" });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse("Bad signature", { status: 400 });
  }

  const sbAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // service role bypasses RLS
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;

        let userId =
          (s.metadata?.supabase_user_id as string | undefined) ||
          (s.client_reference_id as string | undefined);

        if (!userId && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          const custId = (sub.customer as string) || undefined;
          if (custId) {
            const cust = await stripe.customers.retrieve(custId);
            if (!("deleted" in cust)) userId = cust.metadata?.supabase_user_id as string | undefined;
          }
        }

        if (userId && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          await upsertEntitlement(sbAdmin, userId, sub);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        let userId = (sub.metadata?.supabase_user_id as string | undefined) || undefined;
        if (!userId) {
          const custId = (sub.customer as string) || undefined;
          if (custId) {
            const cust = await stripe.customers.retrieve(custId);
            if (!("deleted" in cust)) userId = cust.metadata?.supabase_user_id as string | undefined;
          }
        }

        if (userId) await upsertEntitlement(sbAdmin, userId, sub);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new NextResponse("Webhook error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
