"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuccessPage() {
  const [state, setState] = useState("checking");
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setState("need_login"); return; }
      const t0 = Date.now();
      async function poll() {
        const res = await fetch(`${API}/entitlement`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const j = await res.json();
        if (j?.premium) { setState("active"); return; }
        if (Date.now() - t0 > 30000) { setState("pending"); setNote("We’re finalizing your upgrade. This may take a minute."); return; }
        setTimeout(poll, 2000);
      }
      poll();
    })();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>Thanks for upgrading 🎉</h1>
      {state === "checking"    && <p>Confirming your subscription…</p>}
      {state === "need_login"  && <p>You’re not logged in. <a href="/login">Log in</a> and return to this page.</p>}
      {state === "active"      && <p>Your Mathly Pro is active. <a href="/checkout" style={{textDecoration:"underline"}}>Manage subscription</a></p>}
      {state === "pending"     && <p>{note}</p>}
      {state === "error"       && <p style={{color:"red"}}>{note}</p>}
    </main>
  );
}
