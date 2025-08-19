"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CheckoutPage(){
  const [busy, setBusy] = useState(false);
  const [err,  setErr ] = useState("");

  async function go(){
    setBusy(true); setErr("");
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { window.location.href = "/login"; return; }

    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/create-checkout-session`,
      { method:"POST", headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`
      }}
    );
    const j = await r.json();
    if (!r.ok) {
      if (j.login_url) window.location.href = j.login_url;
      else setErr(j.error || "Error creating checkout session");
      setBusy(false);
      return;
    }
    window.location.href = j.url; // Stripe Hosted Checkout
  }

  return (
    <main style={{maxWidth:520, margin:"60px auto", fontFamily:"Inter,system-ui"}}>
      <h1>Upgrade to Mathly Pro</h1>
      <p>$4.99 / month • unlimited snaps & tutor</p>
      <button disabled={busy} onClick={go}>
        {busy ? "Redirecting…" : "Upgrade"}
      </button>
      {err && <p style={{color:"crimson"}}>{err}</p>}
    </main>
  );
}
