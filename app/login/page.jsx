"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // read ?next=&plan= from URL so we can bounce users straight to checkout
  const params = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const nextHop = params.get("next") || "";          // e.g. "checkout"
  const plan    = params.get("plan") || "monthly";   // "monthly" | "yearly"

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("Sending…");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextHop)}&plan=${encodeURIComponent(plan)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Check your email for the magic link!");
  }

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextHop)}&plan=${encodeURIComponent(plan)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } },
    });
  }

  return (
    <main className="container-nice py-16">
      <div className="max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-gray-600">Choose Google or get a one-click magic link.</p>
      </div>

      <div className="mt-8 max-w-lg rounded-2xl border bg-white p-6 shadow-soft">
        {/* Google first */}
        <button
          onClick={signInWithGoogle}
          className="w-full rounded-xl border px-4 py-3 font-semibold hover:bg-black/5"
        >
          Continue with Google
        </button>

        <div className="my-4 h-px bg-gray-200" />

        {/* Magic link fallback */}
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

        <div className="mt-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">← Back home</Link>
        </div>
      </div>
    </main>
  );
}
