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
  Highlight an equation on any page and get clean, Photomath-style steps
  with explanations at your level — without leaving your doc.
</p>


      <div className="mt-8 flex flex-wrap items-center gap-3">
  <a
    href="/login"
    className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 shadow-soft"
    data-track="cta_try_free_top"
  >
    Try free
  </a>
  <a
    href="/checkout"
    className="rounded-xl border px-6 py-3 hover:bg-black/5"
    data-track="cta_upgrade_top"
  >
    Upgrade to Pro
  </a>

  <span className="ml-1 text-sm text-gray-500">
    No credit card • 60-sec install
  </span>
</div>

<ul className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-600">
  <li className="inline-flex items-center gap-2">
    <img src="/window.svg" alt="" className="w-4 h-4" />
    Works in Docs & PDFs
  </li>
  <li className="inline-flex items-center gap-2">
    <img src="/globe.svg" alt="" className="w-4 h-4" />
    Canvas / LMS
  </li>
  <li className="inline-flex items-center gap-2">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
      <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z"/>
    </svg>
    Private by default
  </li>
</ul>

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
<section className="container-nice py-20">
  <h2 className="text-2xl font-semibold">What Mathly does</h2>

  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {/* 1 */}
    <div className="feature-card">
      <span className="icon-dot">
        {/* sparkles */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l1.4 4.3L18 7.5l-4.6 1.3L12 13l-1.4-4.2L6 7.5l4.6-1.2L12 2zM4 14l.8 2.6L8 18l-2.7.7L4 21l-.8-2.3L1 18l2.2-1.4L4 14zm16 0l.8 2.6L24 18l-2.7.7L20 21l-.8-2.3L17 18l2.2-1.4.8-2.6z"/>
        </svg>
      </span>
      <div className="mt-3 font-medium">Solves & explains</div>
      <p className="mt-1 text-gray-600 text-sm">
        Clean, Photomath-style steps plus real explanations.
      </p>
    </div>

    {/* 2 */}
    <div className="feature-card">
      <span className="icon-dot">
        {/* chat bubble */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h2v3l4-3h6a3 3 0 0 0 3-3V6z"/>
        </svg>
      </span>
      <div className="mt-3 font-medium">Tutor mode</div>
      <p className="mt-1 text-gray-600 text-sm">
        Ask follow-ups like “Explain like I’m 12” or “What’s next?”
      </p>
    </div>

    {/* 3 */}
    <div className="feature-card">
      <span className="icon-dot">
        {/* window */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 4h18v16H3zM3 8h18" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </span>
      <div className="mt-3 font-medium">Works anywhere</div>
      <p className="mt-1 text-gray-600 text-sm">
        Docs, PDFs, Canvas, LMS—or snap any region of your screen.
      </p>
    </div>

    {/* 4 */}
    <div className="feature-card">
      <span className="icon-dot">
        {/* chart */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 20V10h3v10H4zm6 0V4h3v16h-3zm6 0v-7h3v7h-3z"/>
        </svg>
      </span>
      <div className="mt-3 font-medium">Study smarter</div>
      <p className="mt-1 text-gray-600 text-sm">
        Track weak spots and trends as you practice.
      </p>
    </div>

    {/* 5 */}
    <div className="feature-card">
      <span className="icon-dot">
        {/* target */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
        </svg>
      </span>
      <div className="mt-3 font-medium">Premium accuracy</div>
      <p className="mt-1 text-gray-600 text-sm">
        Upgraded models & priority speed on Pro.
      </p>
    </div>

    {/* 6 */}
    <div className="feature-card">
      <span className="icon-dot">
        {/* shield */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/>
        </svg>
      </span>
      <div className="mt-3 font-medium">Privacy first</div>
      <p className="mt-1 text-gray-600 text-sm">
        Your content stays on your device until you ask us to solve.
      </p>
    </div>
  </div>
</section>


      {/* How it works */}
<section className="container-nice py-20">
  <h2 className="text-2xl font-semibold">How it works</h2>

  <div className="mt-8 steps">
    {/* connecting rail (hidden on mobile) */}
    <div className="steps-rail hidden sm:block"></div>

    <div className="grid gap-6 sm:grid-cols-3">
      {/* Step 1 */}
      <div className="step-card relative">
        <div className="badge-num">1</div>
        <div className="mt-3 font-medium">Highlight or snap</div>
        <p className="text-sm text-gray-600 mt-2">
          Select an equation in your doc—or capture any area with SnapSolve.
        </p>

        {/* mini illus */}
        <div className="mt-4 rounded-lg border p-3 bg-gray-50/60">
          <div className="h-20 rounded-md bg-white border grid place-content-center text-gray-400">
            Doc area
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="step-card relative">
        <div className="badge-num">2</div>
        <div className="mt-3 font-medium">Get steps instantly</div>
        <p className="text-sm text-gray-600 mt-2">
          See neat, compact steps with math rendering—right away.
        </p>

        <div className="mt-4 rounded-lg border p-3 bg-gray-50/60">
          <div className="h-20 rounded-md bg-white border grid place-content-center text-gray-400">
            Steps panel
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="step-card relative">
        <div className="badge-num">3</div>
        <div className="mt-3 font-medium">Ask the tutor</div>
        <p className="text-sm text-gray-600 mt-2">
          ELI12, next step, where you went wrong—without leaving your page.
        </p>

        <div className="mt-4 rounded-lg border p-3 bg-gray-50/60">
          <div className="h-20 rounded-md bg-white border grid place-content-center text-gray-400">
            Chat bubble
          </div>
        </div>
      </div>
    </div>
  </div>
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
