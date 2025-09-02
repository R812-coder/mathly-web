// components/Header.jsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkEntitlement(session.user);
      } else {
        setUser(null);
        setIsPremium(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkEntitlement(session.user);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEntitlement = async (user) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/entitlement', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.premium);
      }
    } catch (error) {
      console.error('Error checking entitlement:', error);
    }
  };

  if (loading) {
    return (
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
        <Link href="/" className="font-semibold text-xl text-blue-600">Mathly</Link>
        <nav className="flex items-center gap-4">
          <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
        </nav>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
      <Link href="/" className="font-semibold text-xl text-blue-600">Mathly</Link>
      <nav className="flex items-center gap-4">
        {user ? (
          <>
            {isPremium ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Pro
                </span>
                <Link 
                  href="/settings" 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/upgrade" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade
                </Link>
                <Link 
                  href="/settings" 
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              href="/upgrade" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Pro
            </Link>
            <Link 
              href="/login" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
