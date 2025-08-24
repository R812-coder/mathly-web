export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="container-nice hero-gradient pt-16 pb-20 lg:pt-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl/tight sm:text-6xl/tight font-semibold">
            Understand math instantly. <span className="text-blue-600">Anywhere.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Highlight a problem in Google Docs, PDFs, Canvas—Snap from any page—and Mathly shows clean steps
            and an explanation at your level. No more tab-switching.
          </p>
          <div className="mt-8 flex gap-3">
            <a href="/checkout" className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 shadow-soft">
              Upgrade to Pro
            </a>
            <a href="/login" className="rounded-xl border px-6 py-3 hover:bg-black/5">
              Try free
            </a>
          </div>
          <p className="mt-3 text-sm text-gray-500">Free plan: 10 problems/day • Pro: unlimited & priority speed</p>
        </div>

        {/* Fake screenshot slot (swap with an <Image /> later) */}
        <div className="mt-12 rounded-2xl border shadow-soft bg-white overflow-hidden">
          <div className="aspect-[16/9] w-full bg-gray-50 grid place-content-center text-gray-400">
            <span>Screenshot / demo video</span>
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

      {/* Plans */}
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

      {/* FAQ */}
      <section className="container-nice py-16">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="font-medium">Does it work in my LMS?</div>
            <p className="text-gray-600 text-sm mt-2">Yes—Canvas, Schoology, Google Classroom, and anywhere in Chrome.</p>
          </div>
          <div>
            <div className="font-medium">Is there a free plan?</div>
            <p className="text-gray-600 text-sm mt-2">Yes: 10 problems/day, basic help. Upgrade for unlimited speed & tutor.</p>
          </div>
        </div>
      </section>
    </>
  );
}
