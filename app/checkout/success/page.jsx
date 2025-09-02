"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

export default function SuccessPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [plan, setPlan] = useState("monthly");
  const [sessionId, setSessionId] = useState(null);
  const [confirmationStatus, setConfirmationStatus] = useState("pending"); // pending | success | error
  const [pollingComplete, setPollingComplete] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qp = params.get("plan");
    const sid = params.get("session_id");
    if (qp === "yearly" || qp === "monthly") setPlan(qp);
    if (sid) setSessionId(sid);
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkEntitlement();
      }
    } catch (e) {
      console.error("auth state", e);
    } finally {
      setLoading(false);
    }
  };

  const checkEntitlement = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const r = await fetch("/api/entitlement", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        setIsPremium(!!j?.premium);
      }
    } catch (e) {
      console.error("entitlement", e);
    }
  };

  // Confirm subscription if session_id is present (public, no auth)
  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        setConfirmationStatus("pending");
        await fetch(`/api/confirm-subscription?session_id=${encodeURIComponent(sessionId)}`);
        setConfirmationStatus("success");
        startEntitlementPolling();
      } catch {
        setConfirmationStatus("error");
      }
    })();
  }, [sessionId]);

  const startEntitlementPolling = () => {
    let attempts = 0;
    const max = 45; // ~90s
    const id = setInterval(async () => {
      attempts++;
      try {
        await checkEntitlement();
        if (isPremium) {
          clearInterval(id);
          setPollingComplete(true);
          return;
        }
      } catch {}
      if (attempts >= max) {
        clearInterval(id);
        setPollingComplete(true);
      }
    }, 2000);
    return () => clearInterval(id);
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        window.location.href = "/login?next=/checkout/success";
        return;
      }
      const r = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!r.ok) throw new Error("portal");
      const { url } = await r.json();
      window.location.href = url;
    } catch (e) {
      console.error("portal", e);
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container-nice py-16">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-nice py-16">
      <div className="max-w-2xl mx-auto">
        {sessionId ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-green-600 mb-2">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thanks for upgrading to Mathly Pro. We're finalizing your subscription.
            </p>

            {confirmationStatus === "pending" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Confirming your subscription…</h3>
                    <p className="text-blue-700 text-sm">This usually takes a few seconds.</p>
                  </div>
                </div>
              </div>
            )}

            {confirmationStatus === "success" && !isPremium && !pollingComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-yellow-900">Almost there!</h3>
                <p className="text-yellow-700 text-sm">Your payment is confirmed. We're updating your account…</p>
              </div>
            )}

            {confirmationStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-red-900">Something went wrong</h3>
                <p className="text-red-700 text-sm">Payment succeeded but confirmation failed. Contact support if this persists.</p>
              </div>
            )}

            {isPremium && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-green-900">Welcome to Mathly Pro!</h3>
                <p className="text-green-700 text-sm">Your subscription is active. Enjoy unlimited solving.</p>
              </div>
            )}

            {pollingComplete && !isPremium && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-orange-900">Still processing…</h3>
                <p className="text-orange-700 text-sm">Stripe may take a few minutes. You'll receive a receipt via email.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight">Upgrade to Pro</h1>
            <p className="mt-2 text-gray-600 mb-8">
              Unlimited solves • Priority speed • Step-by-step tutor mode
            </p>
          </>
        )}

        <div className="space-y-4">
          {isPremium ? (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {portalLoading ? "Opening…" : "Manage Subscription"}
            </button>
          ) : (
            <Link
              href="/upgrade"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
            >
              Choose a Plan
            </Link>
          )}

          <Link
            href="/"
            className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center block"
          >
            Back to Home
          </Link>
        </div>

        <section className="mt-10 rounded-2xl border p-6 text-sm text-gray-600">
          <div className="font-medium text-gray-900 mb-2">What happens next?</div>
          <ul className="space-y-2">
            <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>Stripe processes your payment</li>
            <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>You'll get a receipt via email</li>
            <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>Pro features unlock as soon as we update your account</li>
            <li className="flex items-start"><span className="text-green-500 mr-2">✓</span>Manage your plan any time in Settings</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
