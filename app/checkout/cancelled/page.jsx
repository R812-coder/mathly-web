export default function CancelledPage() {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Checkout cancelled</h1>
        <p style={{ marginTop: 8 }}>No worries — your card wasn’t charged.</p>
        <p style={{ marginTop: 16 }}>
          <a href="/checkout" style={{ textDecoration: "underline" }}>Try again</a> or{" "}
          <a href="/" style={{ textDecoration: "underline" }}>return home</a>.
        </p>
      </main>
    );
  }
  