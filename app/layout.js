// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Mathly",
  description: "Mathly — fast, friendly math help",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
        <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
          <a href="/" style={{ marginRight: 12 }}>Home</a>
          <a href="/login" style={{ marginRight: 12 }}>Log in</a>
          <a href="/checkout">Upgrade</a>
        </nav>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
