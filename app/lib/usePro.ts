"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePro() {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) {
        if (mounted) { setIsPro(false); setStatus(null); setLoading(false); }
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", uid)
        .maybeSingle();

      if (!mounted) return;
      if (error) console.warn("usePro select error:", error);

      const st = data?.status ?? null;
      setStatus(st);
      setIsPro(st === "active" || st === "trialing");
      setLoading(false);

      // realtime updates when webhook writes
      channel?.unsubscribe();
      channel = supabase
        .channel("sub-status")
        .on("postgres_changes",
          { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${uid}` },
          () => load()
        )
        .subscribe();
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { mounted = false; sub.subscription.unsubscribe(); channel?.unsubscribe(); };
  }, []);

  return { loading, isPro, status };
}
