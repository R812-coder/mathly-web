// app/api/confirm-subscription/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    // 1) Auth (same pattern as other APIs)
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } = {} } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "no_user" }, { status: 401 });

    // 2) Grab session_id
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");
    if (!session_id) return NextResponse.json({ error: "no_session_id" }, { status: 400 });

    // 3) Retrieve Checkout Session (+ subscription)
    const sess = await stripe.checkout.sessions.retrieve(session_id);
    const customerId = typeof sess.customer === "string" ? sess.customer : sess.customer?.id;
    const subId = typeof sess.subscription === "string" ? sess.subscription : sess.subscription?.id;

    // 4) Pull subscription status/period
    let status = null, current_period_end = null;
    if (subId) {
      const sub = await stripe.subscriptions.retrieve(subId);
      status = sub.status;
      current_period_end = new Date(sub.current_period_end * 1000).toISOString();
    }

    // 5) Upsert profile (idempotent)
    const isPro = status === "active" || status === "trialing";
    await sb.from("profiles").upsert({
      id: user.id,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subId || null,
      subscription_status: status,
      is_premium: isPro,
      current_period_end,
      plan: sess.mode === "subscription" ? (sess?.metadata?.plan || null) : null
    });

    return NextResponse.json({ ok: true, premium: isPro });
  } catch (e) {
    console.error("confirm-subscription error:", e);
    return NextResponse.json({ error: "confirm_failed" }, { status: 500 });
  }
}
