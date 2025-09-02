import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    const sid = new URL(req.url).searchParams.get("session_id");
    if (!sid) return NextResponse.json({ ok: false });

    const session = await stripe.checkout.sessions.retrieve(sid, { expand: ["subscription"] });
    const userId = session?.client_reference_id;
    const customerId = session?.customer;
    const sub = session?.subscription;
    const status = (typeof sub === "object" ? sub?.status : null) || "active";
    const current_period_end = (typeof sub === "object" && sub?.current_period_end)
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    if (!userId || !customerId) return NextResponse.json({ ok: true });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await sb.from("profiles").upsert({
      id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: typeof sub === "object" ? sub.id : (typeof sub === "string" ? sub : null),
      subscription_status: status,
      is_premium: status === "active" || status === "trialing",
      current_period_end,
      plan: session?.mode || null
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("confirm-subscription error:", e);
    return NextResponse.json({ ok: false });
  }
}
