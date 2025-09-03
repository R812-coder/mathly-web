// components/Header.jsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePro } from "@/lib/usePro";
import { openPortal } from "@/lib/billing";

export default function Header() {
  const [user, setUser] = useState(null);
  const { isPro } = usePro();

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      const sub = supabase.auth.onAuthStateChange((_e, s) => {
        setUser(s?.user ?? null);
      });
      unsub = () => sub.data.subscription.unsubscribe();
    })();
    return () => unsub();
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <Link href="/" className="font-semibold">Mathly</Link>

      <nav className="flex items-center gap-4">
        {!user && (
          <Link href="/login">Log in</Link>
        )}

        {user && !isPro && (
          <Link href="/checkout">Upgrade</Link>
        )}

        {user && isPro && (
          <>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-black/10">
              PRO
            </span>
            <button onClick={openPortal} className="text-gray-600 hover:text-gray-900">
              Manage subscription
            </button>
          </>
        )}

        {user && (
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-gray-600 hover:text-gray-900"
          >
            Log out
          </button>
        )}
      </nav>
    </header>
  );
}
