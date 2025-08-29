"use client";
export const dynamic = "force-dynamic"; // don't prerender; render on request

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function SupportContent() {
  const sp = useSearchParams();

  const type = (sp.get("type") === "feature" ? "feature" : "bug");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");

  const context = useMemo(() => {
    const raw = sp.get("ctx");
    if (!raw) return "";
    try {
      const dec = decodeURIComponent(raw);
      const obj = JSON.parse(dec);
      return JSON.stringify(obj, null, 2);
    } catch {
      try { return decodeURIComponent(raw); } catch { return raw; }
    }
  }, [sp]);

  const subject = type === "feature" ? "Feature request" : "Bug report";
  const mailto = useMemo(() => {
    const to = "support@getmathly.com";
    const body = [
      `Type: ${subject}`,
      email ? `Email: ${email}` : "",
      "",
      desc,
      context ? "\n\nContext:\n" + context : ""
    ].filter(Boolean).join("\n");
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [subject, email, desc, context]);

  return (
    <main className="container-nice py-16 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{subject}</h1>
      <p className="mt-2 text-gray-600">Tell us what happened and we’ll jump on it.</p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Your email (optional)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          What’s going on?
          <textarea
            rows={6}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={type === "bug" ? "Steps to reproduce, expected vs actual…" : "What would you like Mathly to do?"}
            className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        {!!context && (
          <details className="rounded-xl border bg-gray-50/50 p-3">
            <summary className="cursor-pointer text-sm font-medium">Attached context</summary>
            <pre className="mt-2 text-xs overflow-auto">{context}</pre>
          </details>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href={mailto}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-soft hover:bg-blue-700"
          >
            Send email
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(
              `${subject}\n${email ? `Email: ${email}\n` : ""}\n${desc}\n\n${context ? `Context:\n${context}` : ""}`
            )}
            className="rounded-xl border px-6 py-3 font-semibold hover:bg-black/5"
          >
            Copy details
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<main className="container-nice py-16"><p>Loading…</p></main>}>
      <SupportContent />
    </Suspense>
  );
}
