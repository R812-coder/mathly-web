// app/page.js
export default function HomePage() {
  return (
    <>
      {/* Hero (Illustrated) */}
<section className="hero-v2 pt-16 pb-24 lg:pt-28">
  <div className="container-nice grid gap-12 lg:grid-cols-2 lg:items-center">
    {/* Left copy */}
    <div>
      <h1 className="text-5xl leading-tight sm:text-6xl font-semibold">
        Understand math instantly.{" "}
        <span className="text-gradient">Anywhere.</span>
      </h1>

      <p className="mt-4 text-lg text-gray-600">
        Highlight a problem in Google Docs, PDFs, Canvas—snap from any page—
        and Mathly shows clean steps with explanations at your level. No more
        tab-switching.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/checkout"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 shadow-soft"
        >
          Upgrade to Pro
        </a>
        <a
          href="/login"
          className="rounded-xl border px-6 py-3 hover:bg-black/5"
        >
          Try free
        </a>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Free: 10 problems/day · Pro: unlimited & priority speed
      </p>
    </div>

    {/* Right illustration */}
    <div className="glass-card p-3 sm:p-4">
      <div className="illustration-frame overflow-hidden">
        {/* Inline SVG so you don’t need to manage image files now */}
        <svg
          viewBox="0 0 960 540"
          role="img"
          aria-label="A document with an equation and a Mathly popup showing the answer"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#eaf2ff" />
              <stop offset="100%" stopColor="#f8fbff" />
            </linearGradient>
            <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* left "doc" */}
          <rect x="24" y="24" width="520" height="492" rx="16" fill="url(#g1)" stroke="#e5edf9"/>
          {/* doc chrome */}
          <rect x="40" y="44" width="488" height="14" rx="7" fill="#e2e8f0"/>
          {/* equation */}
          <text x="72" y="180" fontFamily="ui-sans-serif, system-ui" fontSize="40" fill="#0f172a">
            3x − 4 = 11
          </text>
          {/* faint lines */}
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x="72" y={210 + i*26} width={360 - i*20} height="10" rx="5" fill="#e8eef9" />
          ))}

          {/* arrow to the popup */}
          <path d="M560 200 C610 200 610 260 640 260" stroke="#94a3b8" strokeWidth="3" fill="none" markerEnd="url(#arrow)"/>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* right "Mathly popup" */}
          <rect x="620" y="120" width="316" height="220" rx="14" fill="#ffffff" stroke="#e6ecf8"/>
          {/* popup header */}
          <rect x="620" y="120" width="316" height="46" rx="14" fill="#f8fbff" />
          <text x="640" y="150" fontSize="16" fontWeight="600" fill="#2563eb" fontFamily="ui-sans-serif, system-ui">
            Mathly
          </text>

          {/* answer card */}
          <rect x="644" y="184" width="268" height="80" rx="10" fill="#f9fafb" />
          <text x="664" y="230" fontSize="28" fontWeight="700" fill="#0f172a" fontFamily="ui-sans-serif, system-ui">
            x = 5
          </text>

          {/* action button */}
          <rect x="644" y="276" width="160" height="36" rx="9" fill="url(#btn)" />
          <text x="664" y="300" fontSize="14" fontWeight="600" fill="#ffffff" fontFamily="ui-sans-serif, system-ui">
            Explain steps
          </text>

          {/* subtle shadow under popup */}
          <ellipse cx="778" cy="352" rx="150" ry="14" fill="rgba(15,23,42,.08)" />
        </svg>
      </div>
    </div>
  </div>
</section>


      {/* What Mathly does */}
      <section className="container-nice py-16">
        <h2 className="text-2xl font-semibold">What Mathly does</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Solves & explains", "Get clean, Photomath-style steps with real understanding."],
            ["Tutor mode", "Ask follow-ups like “Explain like I’m 12” or “What’s next?”"],
            ["Works anywhere", "Docs, PDFs, Canvas, LMS, or snap any screen region."],
            ["Study smarter", "Track weak spots and trends as you practice."],
            ["Premium accuracy", "Upgraded models & speed on Pro."],
            ["Privacy first", "Your content stays on your device until you ask us to solve."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border p-5 hover:shadow-soft transition-shadow">
              <div className="font-medium">{title}</div>
              <p className="mt-2 text-gray-600 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-nice py-16">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ["Highlight or snap", "Select an equation in your doc or use SnapSolve."],
            ["Get steps instantly", "See neat, compact steps with math rendering."],
            ["Ask the tutor", "ELI12, next step, where you went wrong—right in the popup."],
          ].map(([t, b], i) => (
            <li key={t} className="rounded-2xl border p-5">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">{i+1}</div>
              <div className="mt-3 font-medium">{t}</div>
              <p className="text-sm text-gray-600 mt-2">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing */}
      <section className="container-nice py-16">
        <h2 className="text-2xl font-semibold">Plans</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <div className="text-sm font-medium text-gray-500">Free</div>
            <div className="mt-2 text-3xl font-semibold">0$</div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• 10 problems/day</li>
              <li>• Basic explanations</li>
              <li>• Works in docs & PDFs</li>
            </ul>
            <a href="/login" className="mt-6 inline-block rounded-xl border px-5 py-3 hover:bg-black/5">Get started</a>
          </div>
          <div className="rounded-2xl border p-6 ring-1 ring-blue-600/20">
            <div className="text-sm font-medium text-blue-600">Premium</div>
            <div className="mt-2 text-3xl font-semibold">$9<span className="text-lg text-gray-500">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Unlimited solves</li>
              <li>• Better accuracy & speed</li>
              <li>• Step-by-step tutor</li>
            </ul>
            <a href="/checkout" className="mt-6 inline-block rounded-xl bg-blue-600 text-white px-5 py-3 hover:bg-blue-700 shadow-soft">
              Upgrade to Pro
            </a>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container-nice pb-24">
        <div className="rounded-2xl border p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Ready to learn faster?</div>
            <p className="text-gray-600 text-sm">Install free, upgrade anytime.</p>
          </div>
          <div className="flex gap-3">
            <a href="/login" className="rounded-xl border px-5 py-3 hover:bg-black/5">Try free</a>
            <a href="/checkout" className="rounded-xl bg-blue-600 text-white px-5 py-3 hover:bg-blue-700 shadow-soft">Get Pro</a>
          </div>
        </div>
      </section>
    </>
  );
}
