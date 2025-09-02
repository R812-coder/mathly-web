"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Redirect authenticated users
        const next = searchParams.get('next');
        if (next) {
          router.push(next);
        } else {
          router.push('/?signed_in=1');
        }
        return;
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  async function onGoogle() {
    const origin = window.location.origin;
    const next = searchParams.get('next') || '/';
    const cb = new URL("/auth/callback", origin);
    cb.searchParams.set("next", next);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: cb.toString() },
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const origin = window.location.origin;
    const next = searchParams.get('next') || '/';
    const cb = new URL("/auth/callback", origin);
    cb.searchParams.set("next", next);
    const redirectTo = cb.toString();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Check your email for the magic link!");
  }

  if (loading) {
    return (
      <main className="container-nice py-16">
        <div className="max-w-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-nice py-16">
      <div className="max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-gray-600">We'll send you a one-click magic link.</p>
      </div>

      <div className="mt-8 max-w-lg rounded-2xl border bg-white p-6 shadow-soft">
        <button onClick={onGoogle} className="w-full rounded-xl border px-4 py-3 font-semibold hover:bg-black/5">
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
        </form>

        {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

        <div className="mt-6 text-sm text-gray-600 flex justify-between">
          <span>New here? Same buttons create an account.</span>
          <Link href={`/login?next=${encodeURIComponent(searchParams.get('next') || '/')}`} className="hover:text-gray-900">
            Already a member? Log in
          </Link>
        </div>
      </div>
    </main>
  );
} 