// app/api/webhooks/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Raw body for signature verification
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function readRawBody(request) {
  const chunks = [];
  const reader = request.body.getReader();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  let event;
  try {
    const sig = req.headers.get("stripe-signature");
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return new NextResponse("Bad signature", { status: 400 });
  }

  try {
    const sbAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      // identify the user
      const supabaseUserId = s.client_reference_id;
      const customerId = s.customer;
      let subId = null;
      if (!subId && s.subscription) subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;

      const plan = s.display_items?.[0]?.plan?.interval ?? undefined;

      // fetch subscription for status/period end
      let status = "active";
      let current_period_end = null;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        status = sub.status;
        current_period_end = new Date(sub.current_period_end * 1000).toISOString();
      }

      await sbAdmin.from("profiles").upsert({
        id: supabaseUserId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subId,
        subscription_status: status,
        is_premium: status === "active" || status === "trialing",
        current_period_end,
        plan: plan || s.mode
      });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted" || event.type === "customer.subscription.created") {
      const sub = event.data.object;
      const customerId = sub.customer;
      const status = sub.status;
      const current_period_end = new Date(sub.current_period_end * 1000).toISOString();

      // find profile by customer id
      const { data: rows } = await sbAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .limit(1);

      if (rows?.[0]?.id) {
        await sbAdmin.from("profiles").upsert({
          id: rows[0].id,
          stripe_subscription_id: sub.id,
          subscription_status: status,
          is_premium: status === "active" || status === "trialing",
          current_period_end
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("webhook error:", e);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
