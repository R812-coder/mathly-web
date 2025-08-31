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
       // decode once or twice depending on what we got
       const once = safeDecode(rawNext);
       const next  = once.startsWith("%") ? safeDecode(once) : once;


        const code = url.searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession({ code });
        } else {
          // Magic-link hash case
          await supabase.auth.getSession();
        }

        const dest = next.startsWith("/") ? next : "/checkout?plan=monthly";
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

function safeDecode(s) {
      try { return decodeURIComponent(s); } catch { return s; }
    }