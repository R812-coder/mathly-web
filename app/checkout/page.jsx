// app/checkout/page.jsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const PRICE_M = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_Y = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

export default function UpgradePage() {
  const [plan, setPlan] = useState("monthly");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);

  const priceId = useMemo(
    () => (plan === "yearly" ? PRICE_Y : PRICE_M),
    [plan]
  );

  // Watch auth state
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      const sub = supabase.auth.onAuthStateChange((_e, s) => {
        setUser(s?.user ?? null);
      });
      unsub = () => sub.data.subscription.unsubscribe();
    })();
    return () => unsub();
  }, []);

  // Fetch entitlement (only when logged in)
  useEffect(() => {
    (async () => {
      if (!user) { setIsPro(false); return; }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch(`/api/entitlement`, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        const j = await r.json();
        setIsPro(!!j?.premium);
      } catch { setIsPro(false); }
    })();
  }, [user]);

  const goLogin = useCallback((toPlan = plan) => {
    const next = encodeURIComponent(`/checkout?plan=${toPlan}`);
    window.location.href = `/login?next=${next}`;
  }, [plan]);

  const startCheckout = useCallback(async () => {
    setMsg("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setLoading(false);
      goLogin(plan);
      return;
    }

    try {
      const r = await fetch(`/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ priceId })
      });
      const j = await r.json();
      if (!r.ok || !j?.url) throw new Error(j?.error || "No checkout url");
      window.location.href = j.url;
    } catch (e) {
      console.error(e);
      setMsg("Could not start checkout (network/CORS).");
    } finally {
      setLoading(false);
    }
  }, [plan, priceId, goLogin]);

  const openPortal = useCallback(async () => {
    setMsg("");
    setPortalLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setPortalLoading(false); goLogin(plan); return; }
    try {
      const r = await fetch(`/api/create-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.url) throw new Error(j?.error || "portal_error");
      window.location.href = j.url;
    } catch (e) {
      console.error(e);
      setMsg("Could not open portal.");
    } finally {
      setPortalLoading(false);
    }
  }, [goLogin, plan]);

  return (
    <main className="container-nice py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Upgrade to Pro</h1>
        <p className="mt-2 text-gray-600">Unlimited solves • Better accuracy • Priority speed</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Monthly card */}
        <div className={`rounded-2xl border p-6 shadow-soft ${plan==="monthly" ? "ring-1 ring-blue-600/20" : ""}`}>
          <div className="text-sm font-medium text-gray-500">Monthly</div>
          <div className="mt-2 text-4xl font-semibold">$9<span className="text-lg text-gray-500">/mo</span></div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Unlimited answers</li>
            <li>• Better accuracy</li>
            <li>• Priority speed</li>
          </ul>

          {!isPro ? (
            <button
              onClick={() => { setPlan("monthly"); startCheckout(); }}
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && plan==="monthly" ? "Loading…" : "Go to Checkout"}
            </button>
          ) : (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="mt-6 inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold hover:bg-black/5 disabled:opacity-60"
            >
              {portalLoading ? "Opening…" : "Manage subscription"}
            </button>
          )}
        </div>

        {/* Yearly card */}
        <div className={`rounded-2xl border p-6 ${plan==="yearly" ? "ring-1 ring-blue-600/20" : ""}`}>
          <div className="text-sm font-medium text-gray-500">
            Yearly <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-blue-600">Save 44%</span>
          </div>
          <div className="mt-2 text-4xl font-semibold">$4.99<span className="text-lg text-gray-500">/mo billed yearly</span></div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Everything in Monthly</li>
            <li>• Priority email support</li>
          </ul>

          {!isPro ? (
            <button
              onClick={() => { setPlan("yearly"); startCheckout(); }}
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold hover:bg-black/5 disabled:opacity-60"
            >
              {loading && plan==="yearly" ? "Loading…" : "Go to Checkout"}
            </button>
          ) : (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="mt-6 inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold hover:bg-black/5 disabled:opacity-60"
            >
              {portalLoading ? "Opening…" : "Manage subscription"}
            </button>
          )}
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
    </main>
  );
}
