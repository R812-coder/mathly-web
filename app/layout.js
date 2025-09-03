// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header"; // ⬅️ use the dynamic header

export const metadata = {
  title: "Mathly — Understand math instantly",
  description: "Explain, solve, and study smarter anywhere on the web.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Optional: tiny perf win for Stripe */}
        <link rel="preconnect" href="https://checkout.stripe.com" />
        <link rel="preconnect" href="https://js.stripe.com" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {/* Top nav */}
        <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
          <div className="container-nice h-14 flex items-center">
            <Header /> {/* ⬅️ drop-in; handles Login/Upgrade/PRO/Manage */}
          </div>
        </nav>

        <main>{children}</main>

        {/* Footer */}
        <footer className="mt-20 border-t">
          <div className="container-nice py-10 text-sm text-gray-600">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} Mathly</div>
              <div className="flex gap-6">
                <a className="hover:text-gray-900" href="/login">Log in</a>
                <a className="hover:text-gray-900" href="/checkout">Pricing</a>
                <a className="hover:text-gray-900" href="mailto:support@getmathly.com">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

