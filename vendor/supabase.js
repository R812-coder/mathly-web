// vendor/supabase.js
// Loads the UMD SDK (packaged locally) and exposes a helper to init a client.
//
// 1) In your extension HTMLs (popup.html, sidepanel.html, any page that needs Supabase):
//    <script src="../vendor/supabase.umd.js"></script>
//    <script src="../vendor/supabase.js"></script>
//
// 2) Then in JS you can do:
//    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
//
// This file also exposes window.mly.sb if you prefer a single shared client.

;(function () {
    if (!window.supabase || !window.supabase.createClient) {
      console.error("[Mathly] Supabase UMD SDK not found. Did you include vendor/supabase.umd.js first?");
      return;
    }
  
    // Optional: initialize a shared client if keys are embedded at build-time.
    // If you prefer to pass keys from page JS, you can remove this section.
    const URL  = window.MLY_SUPABASE_URL  || null;
    const ANON = window.MLY_SUPABASE_ANON || null;
  
    if (URL && ANON) {
      try {
        window.mly = window.mly || {};
        window.mly.sb = window.supabase.createClient(URL, ANON);
        // convenience shims
        window.mly.getSession = () => window.mly.sb.auth.getSession();
        window.mly.signOut   = () => window.mly.sb.auth.signOut();
      } catch (e) {
        console.warn("[Mathly] Could not initialize default Supabase client:", e);
      }
    }
  })();
  