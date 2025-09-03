// lib/billing.ts
import { supabase } from "@/lib/supabaseClient";

async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function goToCheckout(plan: "monthly"|"yearly"="monthly") {
  const headers = await authHeader();
  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ plan })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "CheckoutError");
  window.location.href = json.url;
}

export async function openPortal() {
  const headers = await authHeader();
  const res = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
    headers
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "PortalError");
  window.location.href = json.url;
}
