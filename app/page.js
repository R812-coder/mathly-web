"use client";

import Link from "next/link";
import { supabase } from "../lib/supabaseClient";


export default function Home() {
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link href="/">Home</Link>
        <Link href="/login">Log in</Link>
        <Link href="/checkout">Upgrade</Link>
        <button onClick={signOut} style={{ marginLeft: "auto" }}>Sign out</button>
      </nav>

      <h1>Mathly</h1>
      <p>Welcome! This is your real homepage (app/page.js).</p>
      <p><Link href="/login">Log in</Link> &nbsp; <Link href="/checkout">Upgrade</Link></p>
    </main>
  );
}
