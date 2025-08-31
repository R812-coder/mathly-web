// app/api/entitlement/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return NextResponse.json({ premium: false }, { status: 200 });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ premium: false });

    const { data: profile } = await sb.from("profiles")
      .select("is_premium, subscription_status, current_period_end, plan, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      premium: !!profile?.is_premium,
      status: profile?.subscription_status || null,
      plan: profile?.plan || null,
      customer: !!profile?.stripe_customer_id
    });
  } catch {
    return NextResponse.json({ premium: false });
  }
}
