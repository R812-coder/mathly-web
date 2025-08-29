// app/support/page.jsx
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic"; // this page depends on searchParams

export default function SupportRouter({ searchParams }) {
  const type = (searchParams?.type || "bug").toString();

  // keep other query params (e.g., ctx) on the redirect
  const sp = new URLSearchParams(searchParams);
  sp.delete("type");
  const qs = sp.toString();
  const suffix = qs ? `?${qs}` : "";

  if (type === "bug") redirect(`/support/bug${suffix}`);
  if (type === "feature") redirect(`/support/feature${suffix}`);

  notFound();
}
