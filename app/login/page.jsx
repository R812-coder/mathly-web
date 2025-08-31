// app/login/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export const dynamic = "force-dynamic"; // don't prerender this page

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [next, setNext] = useState("/");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setNext(p.get("next") || "/");
    const mode = p.get("mode");
    if (mode === "signup") setTab("signup");
  }, []);

  const callback = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function onGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback() },
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(tab === "signup" ? "Sending sign-up link…" : "Sending login link…");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback(), shouldCreateUser: true },
    });

    setBusy(false);
    setMsg(
      error ? `Error: ${error.message}` : "Check your email for the magic link!"
    );
  }

  return (
    <main className="container-nice py-16">
      <div className="max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">
          {tab === "signup" ? "Create your account" : "Log in"}
        </h1>
        <p className="mt-2 text-gray-600">
          {tab === "signup"
            ? "Use Google or your email to get started."
            : "We’ll send you a one-click magic link."}
        </p>
      </div>

      <div className="mt-6 flex gap-3 text-sm">
        <button
          onClick={() => {
            setTab("login");
            const u = new URL(window.location.href);
            u.searchParams.delete("mode");
            window.history.replaceState({}, "", u);
          }}
          className={`rounded-xl border px-3 py-1 ${
            tab === "login" ? "bg-black/5" : ""
          }`}
        >
          Log in
        </button>
        <button
          onClick={() => {
            setTab("signup");
            const u = new URL(window.location.href);
            u.searchParams.set("mode", "signup");
            window.history.replaceState({}, "", u);
          }}
          className={`rounded-xl border px-3 py-1 ${
            tab === "signup" ? "bg-black/5" : ""
          }`}
        >
          Create account
        </button>
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
            {busy
              ? "Sending…"
              : tab === "signup"
              ? "Send sign-up link"
              : "Send login link"}
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

        <div className="mt-6 text-sm text-gray-600">
          {tab === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setTab("login");
                  const u = new URL(window.location.href);
                  u.searchParams.delete("mode");
                  window.history.replaceState({}, "", u);
                }}
                className="underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                onClick={() => {
                  setTab("signup");
                  const u = new URL(window.location.href);
                  u.searchParams.set("mode", "signup");
                  window.history.replaceState({}, "", u);
                }}
                className="underline"
              >
                Create an account
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-sm">
          <Link href="/" className="hover:text-gray-900">
            ← Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
