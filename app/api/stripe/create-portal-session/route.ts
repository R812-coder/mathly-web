// app/api/stripe/create-portal-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");

export async function POST(req: Request) {
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "no_token" }, { status: 401 });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "auth_failed" }, { status: 401 });

    // Try to read a customer id
    const { data: row } = await sb
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = row?.stripe_customer_id || null;

    // If missing, create one now and save it (prevents portal errors)
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await sb.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: `${SITE_URL || ""}/account`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("create-portal-session error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
