"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;
const PRICE_M = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_Y = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

export default function SuccessPage() {
  const [msg, setMsg] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [plan, setPlan] = useState("monthly");

  // If someone hits /checkout/success?plan=yearly, honor it.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const qPlan = p.get("plan");
    if (qPlan === "yearly" || qPlan === "monthly") setPlan(qPlan);
  }, []);

  const chosenPrice = useMemo(() => (plan === "yearly" ? PRICE_Y : PRICE_M), [plan]);

  // Centralized login bounce that preserves plan + any query/hash
  const redirectToLogin = useCallback(() => {
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.location.href = `/login?next=${next}`;
  }, []);

  const goToCheckout = useCallback(async () => {
    setMsg("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setLoading(false); redirectToLogin(); return; }

    try {
        const res = await fetch(`${API}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId: chosenPrice }),
      });

      if (res.status === 401) {
        // Try to read a login_url if the backend provides one; otherwise bounce to /login
        let j = {};
        try { j = await res.json(); } catch {}
        if (j?.login_url) window.location.href = j.login_url;
        else redirectToLogin();
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
  }, [chosenPrice, redirectToLogin]);

  const openPortal = useCallback(async () => {
    setMsg("");
    setPortalLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setPortalLoading(false); redirectToLogin(); return; }

    try {
        const r = await fetch(`${API}/create-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.url) throw new Error(j?.error || "portal_error");
      window.location.href = j.url;
    } catch (e) {
      console.error(e);
      setMsg("Could not open portal. If you just upgraded, wait ~1 minute and try again.");
    } finally {
      setPortalLoading(false);
    }
  }, [redirectToLogin]);
  // Poll entitlement while we're on the success page
  useEffect(() => {
        let timer;
        const poll = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) return; // user not logged in on web
          try {
            const r = await fetch(`${API}/entitlement`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const j = await r.json();
            if (j?.premium) { setIsPro(true); setMsg(""); return; }
          } catch {}
          timer = setTimeout(poll, 2000); // try again in 2s
        };
        poll();
        return () => clearTimeout(timer);
      }, []);

  return (
    <main className="container-nice py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Upgrade to Pro</h1>
        <p className="mt-2 text-gray-600">Unlimited solves • Priority speed • Step-by-step tutor mode</p>
      </div>

      {/* Optional: simple plan toggle */}
      <div className="mt-4 flex gap-3 text-sm">
        <button
          className={`rounded-xl border px-3 py-1 ${plan==='monthly' ? 'bg-black/5' : ''}`}
          onClick={() => {
            setPlan("monthly");
            const u = new URL(window.location.href);
            u.searchParams.set("plan", "monthly");
            window.history.replaceState({}, "", u);
          }}
        >
          Monthly
        </button>
        <button
          className={`rounded-xl border px-3 py-1 ${plan==='yearly' ? 'bg-black/5' : ''}`}
          onClick={() => {
            setPlan("yearly");
            const u = new URL(window.location.href);
            u.searchParams.set("plan", "yearly");
            window.history.replaceState({}, "", u);
          }}
        >
          Yearly
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
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
