// app/components/Hero.tsx
import Image from "next/image";
import Link from "next/link";

const STORE_LINK = "https://chromewebstore.google.com/detail/YOUR_ID"; // ← replace later
const SCROLL_PLANS = "#plans";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft bg */}
      <div className="absolute inset-0 -z-10 hero-gradient dark:hero-gradient-dark" />
      <div className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Copy column */}
          <div>
            <h1 className="text-4xl/tight font-extrabold tracking-tight md:text-5xl">
              Understand math instantly.
              <br />
              <span className="text-blue-600 dark:text-blue-400">Anywhere.</span>
            </h1>

            <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-[48ch]">
              Highlight a problem in Docs, PDFs, or Canvas—Mathly shows clean,
              Photomath-style steps with explanations right on top of your page.
              No more tab-switching.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={STORE_LINK}
                className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-500"
              >
                Add to Chrome — Free
              </Link>

              <Link
                href={SCROLL_PLANS}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 font-bold text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                See plans
              </Link>
            </div>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Free: 10 problems/day • Pro: Unlimited & priority speed
            </p>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="pointer-events-none select-none overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
              <Image
                src="/hero-demo.png"        // put a PNG/GIF/WebM poster here
                alt="Mathly showing steps beside your doc"
                width={960}
                height={620}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
