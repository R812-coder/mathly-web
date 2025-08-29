"use client";
import { useState, useMemo, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";

const API     = process.env.NEXT_PUBLIC_BACKEND_URL;
const PRICE_M = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_Y = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

export default function SuccessPage() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [plan, setPlan] = useState("monthly");
  const chosenPrice = useMemo(() => (plan === "yearly" ? PRICE_Y : PRICE_M), [plan]);

  const goToCheckout = useCallback(async () => {
    setMsg("");
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setLoading(false); setMsg("Please log in first."); return; }

    try {
      const res = await fetch(`${API}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ priceId: chosenPrice })
      });

      if (res.status === 401) {
        const j = await res.json().catch(() => ({}));
        window.location.href = j.login_url || "/login";
        return;
      }
      const { url } = await res.json();
      if (!url) throw new Error("No checkout url");
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setMsg("Load failed (network/CORS)");
    } finally {
      setLoading(false);
    }
  }, [chosenPrice]);

  const openPortal = useCallback(async () => {
    setMsg("");
    setPortalLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setPortalLoading(false); setMsg("Please log in first."); return; }

    try {
      const r = await fetch(`${API}/create-portal-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "portal_error");
      window.location.href = j.url;
    } catch (e) {
      console.error(e);
      setMsg("Could not open portal. If you just upgraded, wait ~1 minute and try again.");
    } finally {
      setPortalLoading(false);
    }
  }, []);

  return (
    <main className="container-nice py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Upgrade to Pro</h1>
        <p className="mt-2 text-gray-600">Unlimited solves • Priority speed • Step-by-step tutor mode</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={goToCheckout}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Loading…" : "Go to Checkout"}
        </button>

        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="rounded-xl border px-6 py-3 font-semibold hover:bg-black/5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {portalLoading ? "Opening…" : "Manage subscription"}
        </button>
      </div>

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}

      <section className="mt-10 rounded-2xl border p-6 text-sm text-gray-600 max-w-2xl">
        <div className="font-medium text-gray-900">Tip</div>
        <p className="mt-2">
          If you don’t see your subscription right away, give it a minute after checkout. Stripe can take a moment to notify our backend.
        </p>
      </section>
    </main>
  );
}
