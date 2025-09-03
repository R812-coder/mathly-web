// app/checkout/success/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [ready, setReady] = useState(false);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    let stop = false;

    async function check() {
      const res = await fetch("/api/me", { cache: "no-store" });
      const j = await res.json();
      if (j.isPro) {
        setReady(true);
      } else if (!stop && tries < 10) {
        setTimeout(() => { setTries(t => t + 1); }, 800);
      }
    }
    check();
    return () => { stop = true; };
  }, [tries]);

  return (
    <main className="container-nice py-20 max-w-xl">
      <h1 className="text-2xl font-semibold">Payment successful ✅</h1>
      <p className="mt-2 text-gray-600">
        We’re activating your Pro features…
      </p>

      <div className="mt-6">
        {ready ? (
          <a href="/" className="rounded-xl bg-blue-600 text-white px-5 py-3 hover:bg-blue-700 shadow-soft">
            Continue to Mathly
          </a>
        ) : (
          <div className="text-sm text-gray-500">This can take a couple of seconds.</div>
        )}
      </div>
    </main>
  );
}
