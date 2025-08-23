"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      // Explicitly handle the magic-link callback
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      // Ignore "No code in url" in case Supabase already handled it
      router.replace("/checkout");
    }
    run();
  }, [router]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Signing you in…</h1>
    </main>
  );
}
