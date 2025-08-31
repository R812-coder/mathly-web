"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export const dynamic = "force-dynamic";

const PRICE_M = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_Y = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

export default function SuccessPage() {
  const [msg, setMsg] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [plan, setPlan] = useState("monthly");
  const [justPaid, setJustPaid] = useState(false); // ← key

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const qp = p.get("plan");
    if (qp === "yearly" || qp === "monthly") setPlan(qp);
    if (p.get("session_id")) setJustPaid(true); // ← we came back from Stripe
  }, []);

  // Call confirm API once when we return from Stripe (idempotent, no auth needed)
useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sid = p.get("session_id");
    if (!sid) return;
  
    (async () => {
      try {
        const r = await fetch(`/api/confirm-subscription?session_id=${encodeURIComponent(sid)}`);
        // Optional: if you want to reflect success immediately without waiting for polling:
        // const j = await r.json().catch(()=> ({}));
        // if (j?.premium) setIsPro(true);
      } catch {}
    })();
  }, []); // run once on mount
  
  const chosenPrice = useMemo(
    () => (plan === "yearly" ? PRICE_Y : PRICE_M),
    [plan]
  );

  const redirectToLogin = useCallback(() => {
    const next = encodeURIComponent(
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    );
    window.location.href = `/login?next=${next}`;
  }, []);

  const goToCheckout = useCallback(async () => {
    setMsg("");
    setLoading(true);
    const { data: { session } = {} } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setLoading(false);
      redirectToLogin();
      return;
    }
    try {
      const r = await fetch(`/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId: chosenPrice }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.url) throw new Error(j?.error || "No checkout url");
      window.location.href = j.url;
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
    const { data: { session } = {} } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setPortalLoading(false);
      redirectToLogin();
      return;
    }
    try {
      const r = await fetch(`/api/create-portal-session`, {
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

  // 🔁 Poll entitlement every 2s regardless of initial login state (cap at ~90s)
  useEffect(() => {
    let tries = 0;
    const id = setInterval(async () => {
      tries++;
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session?.access_token) {
        if (tries >= 45) clearInterval(id);
        return;
      }
      try {
        const r = await fetch(`/api/entitlement`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const j = await r.json().catch(() => ({}));
        if (j?.premium) {
          setIsPro(true);
          setMsg("");
          clearInterval(id);
        }
      } catch {}
      if (tries >= 45) clearInterval(id);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="container-nice py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Upgrade to Pro</h1>
        <p className="mt-2 text-gray-600">
          Unlimited solves • Priority speed • Step-by-step tutor mode
        </p>
      </div>

      {/* Plan toggle (optional) */}
      <div className="mt-4 flex gap-3 text-sm">
        <button
          className={`rounded-xl border px-3 py-1 ${plan === "monthly" ? "bg-black/5" : ""}`}
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
          className={`rounded-xl border px-3 py-1 ${plan === "yearly" ? "bg-black/5" : ""}`}
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
        {/* If we just returned from Stripe, show a wait message (hide the checkout button) */}
        {justPaid && !isPro && (
          <div className="rounded-xl border px-4 py-3 text-sm text-gray-600">
            Thanks! We’re confirming your payment… this can take a moment.
          </div>
        )}

        {/* Only show Go to Checkout if user didn’t just pay and isn’t Pro yet */}
        {!justPaid && !isPro && (
          <button
            onClick={goToCheckout}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Loading…" : "Go to Checkout"}
          </button>
        )}


        {/* Show portal button as soon as entitlement flips */}
        {isPro && (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="rounded-xl border px-6 py-3 font-semibold hover:bg-black/5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {portalLoading ? "Opening…" : "Manage subscription"}
          </button>
        )}
      </div>

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}

      <section className="mt-10 max-w-2xl rounded-2xl border p-6 text-sm text-gray-600">
        <div className="font-medium text-gray-900">Tip</div>
        <p className="mt-2">
          If you don’t see your subscription right away, give it a minute after checkout.
          Stripe can take a moment to notify our backend.
        </p>

        {/* If header still shows "Log in", give them a finish-sign-in hint */}
<p className="mt-3 text-sm text-gray-500">
  Already paid? <a className="underline" href={`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Log in</a> to activate on this device.
</p>

      </section>
    </main>
  );
}
