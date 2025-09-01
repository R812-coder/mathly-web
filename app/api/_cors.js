// app/api/_cors.js
export function withCORS(res, request) {
    const origin = request.headers.get('origin') || '*';
  
    // If you know your extension ID, you can lock this down:
    // const allowed = [`chrome-extension://<YOUR_EXTENSION_ID>`, process.env.NEXT_PUBLIC_SITE_URL];
    // const allowOrigin = allowed.includes(origin) ? origin : process.env.NEXT_PUBLIC_SITE_URL;
  
    const allowOrigin = origin === 'null' ? '*' : origin; // fallback when called from SW
  
    res.headers.set('Access-Control-Allow-Origin', allowOrigin);
    res.headers.set('Vary', 'Origin');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Headers', 'authorization,content-type');
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    return res;
  }
  