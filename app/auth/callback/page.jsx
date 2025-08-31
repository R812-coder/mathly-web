"use client";
import { useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/";
        const code = url.searchParams.get("code");

        if (code) {
          await supabase.auth.exchangeCodeForSession({ code });
        } else {
          await supabase.auth.getSession(); // parses hash for magic links
        }

        const sep = next.includes("?") ? "&" : "?";
        window.location.replace(`${next}${sep}signed_in=1`);
      } catch {
        window.location.replace("/login?error=auth");
      }
    })();
  }, []);
  return null;
}
