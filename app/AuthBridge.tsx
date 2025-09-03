"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb   = createClient(url, anon);

export default function AuthBridge() {
  useEffect(() => {
    // 1) send current session once
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        window.postMessage(
          { source: "mathly", type: "MATHLY_OAUTH_SESSION", token: session.access_token },
          "*"
        );
      }
    });

    // 2) send on future auth changes as well
    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => {
      const token = session?.access_token || "";
      window.postMessage(
        { source: "mathly", type: "MATHLY_OAUTH_SESSION", token },
        "*"
      );
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  return null;
}
