"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Sending...");
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
    });

    setMsg(error ? `Error: ${error.message}` : "Check your email for the magic link!");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Log in</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ padding: 8, width: 280 }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>Send magic link</button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      <p style={{ marginTop: 12 }}><Link href="/">Back home</Link></p>
    </main>
  );
}
