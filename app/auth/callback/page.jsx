"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const rawNext = url.searchParams.get("next") || "/";
        // Handles "%2Fcheckout%3Fplan%3Dmonthly" and plain "/checkout?plan=monthly"
        const next = decodeURIComponent(rawNext);

        const code = url.searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession({ code });
        } else {
          // Magic-link hash case
          await supabase.auth.getSession();
        }

        const dest = next.startsWith("/") ? next : "/checkout?plan=monthly"; // safe fallback
        const sep = dest.includes("?") ? "&" : "?";
        window.location.replace(`${dest}${sep}signed_in=1`);
      } catch {
        const backTo = encodeURIComponent("/");
        window.location.replace(`/login?error=auth&next=${backTo}`);
      }
    })();
  }, []);
  return null;
}
