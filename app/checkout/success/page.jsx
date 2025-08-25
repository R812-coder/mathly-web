"use client";
import { useState, useMemo, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";

const API     = process.env.NEXT_PUBLIC_BACKEND_URL;
const PRICE_M = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_Y = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

export default function UpgradePage() {
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
      console.error(e); setMsg("Load failed (network/CORS)");
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
    <main style={{ maxWidth: 860, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Upgrade to Pro</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>Unlimited solves • Priority speed • Step-by-step tutor mode</p>

      {/* plan cards... (your existing mapping stays) */}

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button
          onClick={goToCheckout}
          disabled={loading}
          style={{ padding: "14px 22px", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer",
                   background: "#2563eb", color: "white", boxShadow: "0 10px 30px rgba(37,99,235,.25)" }}>
          {loading ? "Loading…" : "Go to Checkout"}
        </button>

        <button
          onClick={openPortal}
          disabled={portalLoading}
          style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}>
          {portalLoading ? "Opening…" : "Manage subscription"}
        </button>
      </div>

      {msg && <p style={{ color: "red", marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
