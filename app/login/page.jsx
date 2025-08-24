"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Sending…");
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setMsg(error ? `Error: ${error.message}` : "Check your email for the magic link!");
  }

  return (
    <main className="container-nice py-16">
      <div className="max-w-md">
        <h1 className="text-3xl font-semibold">Log in</h1>
        <p className="mt-2 text-gray-600">We’ll send you a magic link.</p>

        <form onSubmit={onSubmit} className="mt-6 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 rounded-xl border px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 shadow-soft"
          >
            Send link
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
        <p className="mt-6"><Link href="/">Back home</Link></p>
      </div>
    </main>
  );
}
