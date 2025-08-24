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
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
        <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
          <Link href="/" style={{ marginRight: 12 }}>Home</Link>
          <Link href="/login" style={{ marginRight: 12 }}>Log in</Link>
          <Link href="/checkout">Upgrade</Link>
        </nav>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
