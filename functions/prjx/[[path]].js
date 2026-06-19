// Cloudflare Pages Function: same-origin proxy for the Project X API.
//
// beta / bera / main deploy to Cloudflare Pages (see .github/workflows/ci.yml),
// which IGNORES vercel.json — so the /prjx/* proxy lives here instead. The
// browser calls /prjx/* same-origin; this Function fetches api.prjx.com
// server-side, sidestepping Project X's CORS allowlist (which blocks browser
// calls from brownfi.io origins).
//
// The matching Vercel rewrite (vercel.json) covers the dev-brownfi.vercel.app
// tier, and vite.config server.proxy covers local dev.
export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const target = 'https://api.prjx.com' + url.pathname.replace(/^\/prjx/, '') + url.search

  const upstream = await fetch(target, {
    method: request.method,
    // Project X returns 403 to requests with no User-Agent, and workerd's fetch
    // sends none by default — so set one explicitly.
    headers: {
      'content-type': 'application/json',
      'user-agent': 'BrownFi-Webswap (+https://brownfi.io)',
    },
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
  })

  const body = await upstream.text()
  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  })
}
