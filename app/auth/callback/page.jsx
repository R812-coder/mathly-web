"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const API     = process.env.NEXT_PUBLIC_BACKEND_URL;
const PRICE_M = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_Y = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

export default function AuthCallback() {
  const [status, setStatus] = useState("Finishing login…");
  const router = useRouter();

  const params = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const nextHop = params.get("next") || "";
  const plan    = (params.get("plan") || "monthly").toLowerCase();
  const priceId = plan === "yearly" ? PRICE_Y : PRICE_M;

  useEffect(() => {
    (async () => {
      try {
        const code = params.get("code");
        if (code) await supabase.auth.exchangeCodeForSession({ code });

        if (nextHop === "checkout") {
          setStatus("Creating checkout…");
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error("no_session");

          const r = await fetch(`${API}/create-checkout-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ priceId }),
          });
          const j = await r.json().catch(() => ({}));
          if (!r.ok || !j?.url) throw new Error(j?.error || "checkout_error");

          window.location.href = j.url; // off to Stripe
          return;
        }

        setStatus("Login complete. Redirecting…");
        setTimeout(() => router.push("/"), 600);
      } catch (e) {
        console.error(e);
        setStatus("Login failed. Try again from the Login page.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container-nice py-16"><p>{status}</p></main>
  );
}
