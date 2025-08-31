// app/login/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";


export default function LoginPage() {
  const sp = useSearchParams();
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const next = sp.get("next") || "/";

  useEffect(() => {
    // If user already logged in, send them where they wanted to go
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        window.location.replace(next);
      }
    })();
  }, [next]);

  const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function onGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (cooldown > 0) return;

    setBusy(true);
    setMsg(tab === "signup" ? "Sending sign-up link…" : "Sending login link…");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl, shouldCreateUser: true },
    });

    setBusy(false);

    if (error) {
      const txt = (error.message || "").toLowerCase();
      if (txt.includes("rate") && txt.includes("limit")) {
        setMsg("We just sent you a link. You can request another in 60s.");
        setCooldown(60);
        const t = setInterval(() => {
          setCooldown((s) => {
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

  return (
    <main className="container-nice py-16">
      <div className="max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">
          {tab === "signup" ? "Create your account" : "Log in"}
        </h1>
        <p className="mt-2 text-gray-600">
          {tab === "signup"
            ? "We’ll send you a one-click magic link to finish sign up."
            : "We’ll send you a one-click magic link to log in."}
        </p>
      </div>

      <div className="mt-6 flex gap-3 text-sm">
        <button
          className={`rounded-xl border px-3 py-1 ${tab==='login' ? 'bg-black/5' : ''}`}
          onClick={() => setTab("login")}
        >
          Log in
        </button>
        <button
          className={`rounded-xl border px-3 py-1 ${tab==='signup' ? 'bg-black/5' : ''}`}
          onClick={() => setTab("signup")}
        >
          Create account
        </button>
      </div>

      <div className="mt-6 max-w-lg rounded-2xl border bg-white p-6 shadow-soft">
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
            disabled={busy || cooldown > 0}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cooldown > 0
              ? `Retry in ${cooldown}s`
              : busy
              ? (tab === "signup" ? "Sending…" : "Sending…")
              : (tab === "signup" ? "Send sign-up link" : "Send login link")}
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

        <div className="mt-6 text-sm text-gray-600">
          {tab === "signup" ? (
            <>Already have an account?{" "}
              <button onClick={() => setTab("login")} className="text-blue-600 hover:underline">Log in</button>
            </>
          ) : (
            <>New here?{" "}
              <button onClick={() => setTab("signup")} className="text-blue-600 hover:underline">Create account</button>
            </>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">← Back home</Link>
        </div>
      </div>
    </main>
  );
}
