"use client";
import { useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";

const API      = process.env.NEXT_PUBLIC_BACKEND_URL;
const PRICE_M  = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY; // optional
const PRICE_Y  = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;  // optional

export default function UpgradePage() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("monthly");

  const chosenPrice = useMemo(() => (plan === "yearly" ? PRICE_Y : PRICE_M), [plan]);

  async function goToCheckout() {
    setMsg("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setLoading(false);
      setMsg("Please log in first.");
      return;
    }

    try {
      const res = await fetch(`${API}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        // the backend can ignore this and use STRIPE_PRICE_ID env; sending is fine
        body: JSON.stringify({ priceId: chosenPrice })
      });

      if (res.status === 401) {
        const err = await res.json().catch(() => ({}));
        window.location.href = err.login_url || "/login";
        return;
      }
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setMsg("Load failed (network/CORS)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Upgrade to Pro</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>
        Unlimited solves • Priority speed • Step-by-step tutor mode
      </p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", marginBottom: 24 }}>
        {[
          { key: "monthly", title: "Monthly", price: "$9/mo" },
          { key: "yearly",  title: "Yearly",  price: "$4.99/mo (billed yearly)", badge: "Save 44%" },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setPlan(p.key)}
            style={{
              padding: 20,
              borderRadius: 16,
              border: plan === p.key ? "2px solid #2563eb" : "1px solid #e2e8f0",
              textAlign: "left",
              boxShadow: plan === p.key ? "0 10px 30px rgba(37,99,235,.15)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</div>
              {p.badge && (
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "#eef2ff", border: "1px solid #c7d2fe" }}>
                  {p.badge}
                </span>
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>{p.price}</div>
            <ul style={{ marginTop: 12, color: "#334155", lineHeight: 1.5 }}>
              <li>Unlimited answers</li>
              <li>Better accuracy</li>
              <li>Priority solving speed</li>
            </ul>
          </button>
        ))}
      </div>

      <button
        onClick={goToCheckout}
        disabled={loading}
        style={{
          padding: "14px 22px",
          borderRadius: 12,
          border: "none",
          fontWeight: 700,
          cursor: "pointer",
          background: "#2563eb",
          color: "white",
          boxShadow: "0 10px 30px rgba(37,99,235,.25)"
        }}
      >
        {loading ? "Loading…" : "Go to Checkout"}
      </button>

      {msg && <p style={{ color: "red", marginTop: 12 }}>{msg}</p>}
    </main>
  );
}

<button onClick={openPortal} style={{ marginLeft: 12, padding: "12px 20px", borderRadius: 12 }}>
  Manage subscription
</button>

async function openPortal() {
    setMsg(""); 
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setMsg("Please log in first."); return; }
  
    try {
      const r = await fetch(`${API}/create-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "portal_error");
      window.location.href = j.url;
    } catch (e) {
      setMsg("Could not open portal. If you just upgraded, wait a minute and try again.");
    }
  }
  