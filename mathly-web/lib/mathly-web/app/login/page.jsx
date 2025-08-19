"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg]   = useState("");

  async function emailLink(e){
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setMsg(error ? error.message : "Check your email for a sign-in link.");
  }

  async function google(){
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  }

  return (
    <main style={{maxWidth:420, margin:"60px auto", fontFamily:"Inter,system-ui"}}>
      <h1>Sign in</h1>
      <button onClick={google}>Continue with Google</button>
      <div style={{margin:"16px 0"}}>— or —</div>
      <form onSubmit={emailLink}>
        <input
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="you@email.com"
          required
        />
        <button type="submit">Send magic link</button>
      </form>
      <p>{msg}</p>
    </main>
  );
}
