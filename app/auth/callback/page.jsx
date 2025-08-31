"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/";
        // Handle OAuth (code param) and magic-link (hash) flows
        const code = url.searchParams.get("code");
        if (code) await supabase.auth.exchangeCodeForSession({ code });
        else await supabase.auth.getSession(); // will parse hash if present
        window.location.replace(`${next}${next.includes("?") ? "&" : "?"}signed_in=1`);
      } catch {
        window.location.replace("/login?error=auth");
      }
    })();
  }, []);
  return null;
}
