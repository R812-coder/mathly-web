// app/login/page.jsx
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [msg, setMsg]         = useState("");
  const [nextPath, setNext]   = useState("/");

  // Read ?next=… and keep it as raw-decoded path (no double-encoding)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const decoded = sp.get("next") ? decodeURIComponent(sp.get("next")) : "/";
    setNext(decoded);
  }, []);

  async function onGoogle() {
    const origin = window.location.origin;
    const cb = new URL("/auth/callback", origin);
    cb.searchParams.set("next", nextPath); // ✅ use state
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: cb.toString() },
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const origin = window.location.origin;
    const cb = new URL("/auth/callback", origin);
    cb.searchParams.set("next", nextPath); // ✅ use state
    const redirectTo = cb.toString();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Check your email for the magic link!");
  }

  return (
    <main className="container-nice py-16">
      <div className="max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-gray-600">We’ll send you a one-click magic link.</p>
      </div>

      <div className="mt-8 max-w-lg card p-6">
        <button onClick={onGoogle} className="btn w-full">
          Continue with Google
        </button>

        <div className="my-4 text-center text-xs text-gray-400">or</div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input mt-1"
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary w-full"
          >
            {busy ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

        <div className="mt-6 text-sm text-gray-600 flex justify-between">
          <span>New here? Same buttons create an account.</span>
          {/* Keep next hop intact for users who navigate back here */}
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="hover:text-gray-900">
            Use a different email
          </Link>
        </div>
      </div>
    </main>
  );
}
