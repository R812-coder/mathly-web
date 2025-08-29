"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ReportBugPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setUrl(window.location.href);
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await supabase.from("feedback").insert({
      type: "bug",
      title,
      description: desc,
      url,
      user_id: userId
    });
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Thanks! We got your report.");
    if (!error) { setTitle(""); setDesc(""); }
  }

  return (
    <main className="container-nice py-16 max-w-2xl">
      <h1 className="text-3xl font-semibold">Report a bug</h1>
      <p className="mt-2 text-gray-600 text-sm">What broke? Steps to reproduce really help.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="w-full rounded-xl border px-4 py-3" placeholder="Short title"
               value={title} onChange={e=>setTitle(e.target.value)} required />
        <textarea className="w-full rounded-xl border px-4 py-3" rows={6}
          placeholder="What happened? What did you expect?"
          value={desc} onChange={e=>setDesc(e.target.value)} required />
        <input className="w-full rounded-xl border px-4 py-3" placeholder="Page URL (optional)"
               value={url} onChange={e=>setUrl(e.target.value)} />
        <button disabled={busy}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? "Sending…" : "Submit"}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </main>
  );
}
