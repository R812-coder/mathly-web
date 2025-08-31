// app/api/confirm-subscription/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// No Supabase user login required: we trust the session_id from Stripe
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");
    if (!session_id) {
      return NextResponse.json({ error: "no_session_id" }, { status: 400 });
    }

    // 1) Get the Checkout Session (+subscription)
    const sess = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });

    // We set this when creating the session
    const supabaseUserId =
      sess.client_reference_id || sess?.metadata?.supabase_user_id || null;

    const customerId =
      typeof sess.customer === "string" ? sess.customer : sess.customer?.id;

    // Normalize subscription fields
    const subObj =
      typeof sess.subscription === "string"
        ? await stripe.subscriptions.retrieve(sess.subscription)
        : sess.subscription || null;

    const subId = subObj?.id || null;
    const status = subObj?.status || null;
    const current_period_end = subObj?.current_period_end
      ? new Date(subObj.current_period_end * 1000).toISOString()
      : null;

    const isPro = status === "active" || status === "trialing";

    // 2) If we can't map to a Supabase user, we still return success
    // (webhook will handle it later), but we can't upsert.
    if (!supabaseUserId) {
      return NextResponse.json({ ok: true, premium: isPro, mapped: false });
    }

    // 3) Upsert the profile using service role (server only)
    const sbAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await sbAdmin.from("profiles").upsert({
      id: supabaseUserId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subId,
      subscription_status: status,
      is_premium: isPro,
      current_period_end,
      plan: sess?.metadata?.plan || null,
    });

    return NextResponse.json({ ok: true, premium: isPro, mapped: true });
  } catch (e) {
    console.error("confirm-subscription error:", e);
    return NextResponse.json({ error: "confirm_failed" }, { status: 500 });
  }
}
