// app/checkout/page.jsx  (SERVER FILE)
// No "use client" and no hooks here.
export const dynamic = "force-dynamic";

import CheckoutClient from "./CheckoutClient";

export default function Page() {
  return <CheckoutClient />;
}
