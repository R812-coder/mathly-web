"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const [status, setStatus] = useState("Finishing login…");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const next = params.get("next") || "/";
        if (code) await supabase.auth.exchangeCodeForSession({ code });
        setStatus("Login complete. Redirecting…");
        router.replace(next);
      } catch (e) {
        console.error(e);
        setStatus("Login failed. Try again from the Login page.");
      }
    })();
  }, [router]);

  return (
    <main className="container-nice py-16">
      <p>{status}</p>
    </main>
  );
}
