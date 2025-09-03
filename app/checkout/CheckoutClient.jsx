// app/checkout/CheckoutClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { usePro } from "@/lib/usePro";
import { goToCheckout, openPortal } from "@/lib/billing";

export default function CheckoutClient() {
  const { isPro } = usePro();
  const [user, setUser] = useState(null);
  const [busyPlan, setBusyPlan] = useState("");

  // Read ?plan=monthly|yearly from URL (defaults to monthly)
  const [plan, setPlan] = useState("monthly");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p === "yearly" || p === "monthly") setPlan(p);
  }, []);

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

  const handleUpgrade = async (which) => {
    // If not logged in, send to /login?next=/checkout?plan=which
    if (!user) {
      const next = `/checkout?plan=${encodeURIComponent(which)}`;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }
    try {
      setBusyPlan(which);
      await goToCheckout(which);
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
      setBusyPlan("");
    }
  };

  const priceCopy = useMemo(() => ({
    monthly: { price: "$9", note: "/mo" },
    yearly: { price: "$84", note: "/yr (save 22%)" }, // adjust to your Stripe prices
  }), []);

  return (
    <main className="container-nice py-14">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Choose your plan</h1>
        <p className="mt-2 text-gray-600">Upgrade instantly. Cancel anytime.</p>
      </div>

      {/* If already PRO */}
      {isPro ? (
        <div className="mt-8 max-w-3xl rounded-2xl border bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold flex items-center gap-2">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-black/10">
                  PRO
                </span>
                You’re on Pro
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Enjoy unlimited solves and premium speed. You can manage your billing below.
              </p>
            </div>
            <button onClick={openPortal} className="rounded-xl border px-5 py-3 hover:bg-black/5">
              Manage subscription
            </button>
          </div>
        </div>
      ) : null}

      {/* Plans */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 max-w-3xl">
        {/* Monthly */}
        <div className={`rounded-2xl border p-6 ${plan === "monthly" ? "ring-1 ring-blue-600/20" : ""}`}>
          <div className="text-sm font-medium text-gray-500">Monthly</div>
          <div className="mt-2 text-3xl font-semibold">
            {priceCopy.monthly.price}
            <span className="text-lg text-gray-500">{priceCopy.monthly.note}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Unlimited solves</li>
            <li>• Better accuracy & speed</li>
            <li>• Step-by-step tutor</li>
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => handleUpgrade("monthly")}
              disabled={busyPlan === "monthly" || isPro}
              className="rounded-xl bg-blue-600 text-white px-5 py-3 hover:bg-blue-700 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busyPlan === "monthly" ? "Starting checkout…" : "Upgrade monthly"}
            </button>
            <button
              onClick={() => setPlan("monthly")}
              className={`rounded-xl border px-5 py-3 hover:bg-black/5 ${plan === "monthly" ? "bg-black/5" : ""}`}
            >
              Select
            </button>
          </div>
        </div>

        {/* Yearly */}
        <div className={`rounded-2xl border p-6 ${plan === "yearly" ? "ring-1 ring-blue-600/20" : ""}`}>
          <div className="text-sm font-medium text-blue-600">Yearly</div>
          <div className="mt-2 text-3xl font-semibold">
            {priceCopy.yearly.price}
            <span className="text-lg text-gray-500">{priceCopy.yearly.note}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Unlimited solves</li>
            <li>• Better accuracy & speed</li>
            <li>• Step-by-step tutor</li>
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => handleUpgrade("yearly")}
              disabled={busyPlan === "yearly" || isPro}
              className="rounded-xl bg-blue-600 text-white px-5 py-3 hover:bg-blue-700 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busyPlan === "yearly" ? "Starting checkout…" : "Upgrade yearly"}
            </button>
            <button
              onClick={() => setPlan("yearly")}
              className={`rounded-xl border px-5 py-3 hover:bg-black/5 ${plan === "yearly" ? "bg-black/5" : ""}`}
            >
              Select
            </button>
          </div>
        </div>
      </div>

      {/* Not logged in helper */}
      {!user && !isPro && (
        <p className="mt-6 text-sm text-gray-600">
          You’ll be asked to log in first. Don’t worry—we’ll bring you right back here.
        </p>
      )}

      {/* Safety links */}
      <div className="mt-10 text-sm text-gray-500">
        <Link className="hover:text-gray-900" href="/support">Need help?</Link>
      </div>
    </main>
  );
}
