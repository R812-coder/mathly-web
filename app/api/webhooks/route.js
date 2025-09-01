// app/api/webhooks/route.js
export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";



// Raw body for signature verification
// (remove the config export)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const whSecret = process.env.STRIPE_WEBHOOK_SECRET;


export async function POST(req) {
  let event;
  try {
    const sig = req.headers.get("stripe-signature");
    const raw = await req.text(); // App Router
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

    // app/api/webhooks/route.js  (inside POST() after you init sbAdmin, stripe, etc.)

if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.created"
  ) {
    const sub = event.data.object;
    const customerId = sub.customer;
    const status = sub.status; // 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | ...
    const current_period_end = new Date(sub.current_period_end * 1000).toISOString();
  
    // find profile by customer id
    const { data: rows, error: findErr } = await sbAdmin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .limit(1);
  
    if (findErr) {
      console.error("profiles lookup failed:", findErr);
    }
  
    if (rows?.[0]?.id) {
      const premiumNow = status === "active" || status === "trialing";
  
      const { error: upErr } = await sbAdmin.from("profiles").upsert({
        id: rows[0].id,
        stripe_subscription_id: sub.id,
        subscription_status: status,
        is_premium: premiumNow,                 // ← always set based on status
        current_period_end
      });
  
      if (upErr) console.error("profiles upsert failed:", upErr);
    }
  }
  

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("webhook error:", e);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
