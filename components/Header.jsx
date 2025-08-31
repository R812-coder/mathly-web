// components/Header.jsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);

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
        <Link href="/checkout">Upgrade</Link>
        {user ? (
          <>
            <Link href="/checkout/success">Account</Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-600 hover:text-gray-900"
            >
              Log out
            </button>
          </>
        ) : (
          <Link href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
