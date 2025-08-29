"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setNext(p.get("next") || "/");
  }, []);

  async function onGoogle() {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("Sending…");
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
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

      <div className="mt-8 max-w-lg rounded-2xl border bg-white p-6 shadow-soft">
        <button
          onClick={onGoogle}
          className="w-full rounded-xl border px-4 py-3 font-semibold hover:bg-black/5"
        >
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

          <button
  type="submit"
  disabled={busy || cooldown > 0}
  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
>
  {cooldown > 0 ? `Retry in ${cooldown}s` : busy ? "Sending…" : "Send magic link"}
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
// app/login/page.jsx (additions)
const [cooldown, setCooldown] = useState(0);

async function onSubmit(e) {
  e.preventDefault();
  if (cooldown > 0) return;
  setBusy(true);
  setMsg("Sending…");
  const origin = window.location.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });

  setBusy(false);

  if (error) {
    const txt = error.message?.toLowerCase() || "";
    if (txt.includes("rate") && txt.includes("limit")) {
      setMsg("We just sent you a link. You can request another in 60s.");
      setCooldown(60);
      const t = setInterval(() => {
        setCooldown(s => {
          if (s <= 1) { clearInterval(t); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      setMsg(`Error: ${error.message}`);
    }
  } else {
    setMsg("Check your email for the magic link!");
  }
}
