// app/api/create-checkout-session/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    // 1) Auth: read Supabase access token from Authorization header
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // 2) Get currently logged-in user from Supabase using their token
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error: userErr } = await sb.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "no_user" }, { status: 401 });

    const { priceId } = await req.json();

    // 3) Ensure we have / create a Stripe customer tied to this user
    const { data: profile } = await sb
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      await sb.from("profiles").upsert({ id: user.id, stripe_customer_id: customerId });
    }

    // 4) Create Checkout Session
    const site = process.env.NEXT_PUBLIC_SITE_URL || (await req.headers.get("origin"));
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id, // helps in webhook
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/checkout/success?plan=${priceId.includes("year") ? "yearly" : "monthly"}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/checkout/cancelled`,
      allow_promotion_codes: true
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return NextResponse.json({ error: "create_session_failed" }, { status: 500 });
  }
}

