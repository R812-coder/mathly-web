// app/layout.js
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Mathly",
  description: "Mathly — fast, friendly math help",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="text-gray-900 antialiased">
        <nav className="border-b">
          <div className="container-nice h-14 flex items-center gap-6">
            <Link href="/" className="font-medium">Home</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
            <Link href="/checkout" className="text-gray-600 hover:text-gray-900">Upgrade</Link>
            <div className="ml-auto">
              {/* right side empty for now */}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
