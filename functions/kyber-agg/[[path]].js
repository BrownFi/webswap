// Cloudflare Pages Function: same-origin proxy for the KyberSwap Aggregator API.
//
// 2026-07-16: Kyber turned on Cloudflare bot-protection for
// aggregator-api.kyberswap.com, which now returns a 403 challenge page to
// browser fetches. That block page carries NO `Access-Control-Allow-Origin`, so
// the browser rejects the CORS preflight ("net::ERR_FAILED") and the Kyber swap
// route silently disappears from the app.
//
// Routing through this same-origin Function makes the browser call /kyber-agg/*
// on our own origin (no CORS), and this Function fetches Kyber server-side with
// a real User-Agent — sidestepping the browser wall. NOTE: if Kyber also
// challenges this egress IP, the real fix is Kyber allowlisting us (API key /
// WAF bypass) — set VITE_KYBERSWAP_AGG_API_KEY and it flows through as x-api-key.
//
// beta / bera / main deploy to Cloudflare Pages (which IGNORES vercel.json), so
// the prod proxy lives here. Mirror: vercel.json rewrite (Vercel tier) +
// vite.config server.proxy (local dev). Sibling of functions/prjx.
const TARGET = 'https://aggregator-api.kyberswap.com'

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const target = TARGET + url.pathname.replace(/^\/kyber-agg/, '') + url.search

  const headers = {
    // workerd's fetch sends no User-Agent by default, and Cloudflare-protected
    // hosts 403 that — set a real one.
    'user-agent': 'BrownFi-Webswap (+https://brownfi.io)',
    // Kyber's client identifier (avoids the stricter anonymous rate limit).
    'x-client-id': request.headers.get('x-client-id') || 'BrownFi',
  }
  // Forward an API key if the app is configured with one (Kyber allowlist path).
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) headers['x-api-key'] = apiKey

  const isWrite = request.method !== 'GET' && request.method !== 'HEAD'
  if (isWrite) headers['content-type'] = request.headers.get('content-type') || 'application/json'

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    // Read the body to a string (workerd streaming needs duplex; text is simpler
    // and route/build payloads are small).
    body: isWrite ? await request.text() : undefined,
  })

  const body = await upstream.text()
  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      // Quotes are volatile — never cache route/build responses.
      'cache-control': 'no-store',
    },
  })
}
