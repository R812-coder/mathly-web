// app/api/me/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );

  const { data: { session } } = await sb.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ isPro: false, status: null });

  const { data } = await sb
    .from("subscriptions")
    .select("status")
    .eq("user_id", uid)
    .maybeSingle();

  const st = data?.status ?? null;
  return NextResponse.json({ isPro: st === "active" || st === "trialing", status: st });
}
