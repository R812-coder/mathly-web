// app/checkout/CheckoutClient.jsx  (CLIENT FILE)
"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const PRICE_M = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_Y = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

export default function CheckoutClient() {
  const [plan, setPlan] = useState("monthly");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const priceId = useMemo(() => (plan === "yearly" ? PRICE_Y : PRICE_M), [plan]);

  // Tiny confirmation + honor ?plan=
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);

    if (sp.get("signed_in") === "1") {
      setMsg("You're signed in — pick a plan to continue.");
      sp.delete("signed_in");
      const u = new URL(window.location.href);
      u.search = sp.toString();
      window.history.replaceState({}, "", u.toString());
    }

    const p = sp.get("plan");
    if (p === "yearly" || p === "monthly") setPlan(p);
  }, []);

  const startCheckout = useCallback(async () => {
    setMsg("");
    setLoading(true);

    const { data: { session } = {} } = await supabase.auth.getSession();

    const here = `${window.location.pathname}${window.location.search}${window.location.hash}`;
     if (!session?.access_token) {
       const loginUrl = new URL('/login', window.location.origin);
       loginUrl.searchParams.set('next', here); // let URL do the encoding ONCE
       window.location.href = loginUrl.toString();
       return;
     }

    try {
      const r = await fetch(`/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.url) throw new Error(j?.error || "No checkout url");
      window.location.href = j.url;
    } catch (e) {
      console.error(e);
      setMsg("Could not start checkout (network/CORS).");
    } finally {
      setLoading(false);
    }
  }, [priceId]);

  return (
    <main className="container-nice py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Upgrade to Pro</h1>
        <p className="mt-2 text-gray-600">Unlimited solves • Priority speed • Step-by-step tutor</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Monthly */}
        <div className={`rounded-2xl border p-6 shadow-soft ${plan === "monthly" ? "ring-1 ring-blue-600/20" : ""}`}>
          <div className="text-sm font-medium text-gray-500">Monthly</div>
          <div className="mt-2 text-4xl font-semibold">
            $9<span className="text-lg text-gray-500">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Unlimited answers</li><li>• Better accuracy</li><li>• Priority solving speed</li>
          </ul>
          <button
            onClick={() => { setPlan("monthly"); const u = new URL(window.location.href); u.searchParams.set("plan","monthly"); window.history.replaceState({}, "", u); startCheckout(); }}
            disabled={loading}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && plan === "monthly" ? "Loading…" : "Go to Checkout"}
          </button>
        </div>

        {/* Yearly */}
        <div className={`rounded-2xl border p-6 ${plan === "yearly" ? "ring-1 ring-blue-600/20" : ""}`}>
          <div className="text-sm font-medium text-gray-500">
            Yearly <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-blue-600">Save 44%</span>
          </div>
          <div className="mt-2 text-4xl font-semibold">
            $4.99<span className="text-lg text-gray-500">/mo billed yearly</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Everything in Monthly</li><li>• Priority email support</li>
          </ul>
          <button
            onClick={() => { setPlan("yearly"); const u = new URL(window.location.href); u.searchParams.set("plan","yearly"); window.history.replaceState({}, "", u); startCheckout(); }}
            disabled={loading}
            className="mt-6 inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold hover:bg-black/5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && plan === "yearly" ? "Loading…" : "Go to Checkout"}
          </button>
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-blue-700">{msg}</p>}
    </main>
  );
}
