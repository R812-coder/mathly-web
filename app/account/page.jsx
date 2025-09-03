"use client";
import { openPortal } from "@/lib/billing";
import { usePro } from "@/lib/usePro";

export default function AccountPage() {
  const { isPro } = usePro();

  return (
    <main className="container-nice py-14 max-w-xl">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-2 text-gray-600">Manage your Mathly subscription and billing.</p>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            Status:{" "}
            <span className={`font-medium ${isPro ? "text-green-600" : "text-gray-600"}`}>
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
          <button onClick={openPortal} className="rounded-xl border px-5 py-3 hover:bg-black/5">
            Manage subscription
          </button>
        </div>
      </div>
    </main>
  );
}
