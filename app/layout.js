// app/layout.js
import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";

export const metadata = {
  title: "Mathly — Understand math instantly",
  description: "Explain, solve, and study smarter anywhere on the web.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {/* Top nav */}
        <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
          <div className="container-nice h-14 flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight">Mathly</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
            <Link href="/checkout" className="text-gray-600 hover:text-gray-900">Upgrade</Link>
            <div className="ml-auto">
              <a href="/checkout" className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-soft">
                Get Pro
              </a>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        {/* Footer */}
        <footer className="mt-20 border-t">
          <div className="container-nice py-10 text-sm text-gray-600">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} Mathly</div>
              <div className="flex gap-6">
                <Link className="hover:text-gray-900" href="/login">Log in</Link>
                <Link className="hover:text-gray-900" href="/checkout">Pricing</Link>
                <a className="hover:text-gray-900" href="mailto:support@mathly.app">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
