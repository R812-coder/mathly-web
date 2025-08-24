export default function UpgradePage() {
    const checkout = process.env.NEXT_PUBLIC_CHECKOUT_URL || "/checkout/success"; // temp fallback
  
    return (
      <main className="container-nice py-16">
        <h1 className="text-3xl font-semibold">Upgrade to Pro</h1>
        <p className="mt-2 text-gray-600">Unlimited solves • Priority speed • Step-by-step tutor mode</p>
  
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <div className="text-sm font-medium text-gray-500">Monthly</div>
            <div className="mt-2 text-4xl font-semibold">$9<span className="text-lg text-gray-500">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Unlimited answers</li>
              <li>• Better accuracy</li>
              <li>• Priority solving speed</li>
            </ul>
            <a href={checkout} className="mt-6 inline-block rounded-xl bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 shadow-soft">
              Go to Checkout
            </a>
          </div>
          <div className="rounded-2xl border p-6">
            <div className="text-sm font-medium text-gray-500">Yearly <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-blue-600">Save 44%</span></div>
            <div className="mt-2 text-4xl font-semibold">$4.99<span className="text-lg text-gray-500">/mo billed yearly</span></div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Everything in Monthly</li>
              <li>• Priority email support</li>
            </ul>
            <a href={checkout} className="mt-6 inline-block rounded-xl border px-6 py-3 hover:bg-black/5">
              Go to Checkout
            </a>
          </div>
        </div>
      </main>
    );
  }
  