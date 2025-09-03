// app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!;
const PRICE_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY!;
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL!;

export async function POST(req: Request) {
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "no_token" }, { status: 401 });

    // 1) Get the user using the anon key + user token
    const sbUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await sbUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "auth_failed" }, { status: 401 });

    const { plan = "monthly" } = await req.json().catch(() => ({}));
    const price = plan === "yearly" ? PRICE_YEARLY : PRICE_MONTHLY;

    // 2) Use the **service role** for DB writes so RLS can stay tight
    const sbAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Reuse or create Stripe customer
    const { data: existing } = await sbAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      await sbAdmin.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      metadata: { supabase_user_id: user.id, plan },
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout/cancelled`
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
