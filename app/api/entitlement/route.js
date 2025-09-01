// app/api/entitlement/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,              // your webapp origin
  `chrome-extension://${process.env.NEXT_PUBLIC_EXT_ID}`, // your extension id (set this env var)
].filter(Boolean);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(req) {
  const origin = req.headers.get("origin") || "";
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ premium: false }, { status: 200, headers: corsHeaders(origin) });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ premium: false }, { status: 200, headers: corsHeaders(origin) });
    }

    const { data: profile } = await sb.from("profiles")
      .select("is_premium, subscription_status, current_period_end, plan, stripe_customer_id")
      .eq("id", user.id).maybeSingle();

    return NextResponse.json({
      premium: !!profile?.is_premium,
      status: profile?.subscription_status || null,
      plan: profile?.plan || null,
      customer: !!profile?.stripe_customer_id
    }, { headers: corsHeaders(origin) });
  } catch {
    return NextResponse.json({ premium: false }, { headers: corsHeaders(origin) });
  }
}
