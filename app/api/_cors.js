// app/api/_cors.js

const ALLOWED = [
  process.env.NEXT_PUBLIC_SITE_URL,   // e.g. https://getmathly.com
  process.env.NEXT_PUBLIC_WEB_URL,    // optional secondary domain
].filter(Boolean);

function pickOrigin(req) {
  const origin = req.headers.get('origin') || '';
  if (!origin) return '*';

  // Allow our own web origins
  if (ALLOWED.includes(origin)) return origin;

  // Allow the browser extension origin(s)
  if (origin.startsWith('chrome-extension://')) return origin;

  // Otherwise, no credentials and wildcard
  return '*';
}

export function corsHeaders(req) {
  const origin = pickOrigin(req);
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin',
  };
  if (origin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

export function preflight(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }
  return null;
}

/**
 * Convenience: wrap a Response/NextResponse with CORS headers.
 * Usage:
 *   const pre = preflight(req); if (pre) return pre;
 *   return withCors(req, NextResponse.json(data));
 */
export function withCors(req, res) {
  const headers = corsHeaders(req);
  // Merge headers onto the response
  for (const [k, v] of Object.entries(headers)) {
    try { res.headers.set(k, v); } catch { /* NextResponse vs Response */ }
  }
  return res;
}
  