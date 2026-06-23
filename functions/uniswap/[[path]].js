// Cloudflare Pages Function: same-origin proxy for the Uniswap interface API.
//
// beta / bera / main deploy to Cloudflare Pages (see .github/workflows/ci.yml),
// which IGNORES vercel.json — so the /uniswap/* proxy lives here. The browser
// calls /uniswap/* same-origin; this Function fetches the Uniswap gateway
// server-side with `Origin: https://app.uniswap.org`, which is on the gateway's
// allowlist (brownfi.io origins and no-origin both get 409 ACCESS_DENIED).
//
// The matching Vercel function (api/uniswap.js) covers dev-brownfi.vercel.app,
// and vite.config server.proxy covers local dev.
export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const target = 'https://interface.gateway.uniswap.org' + url.pathname.replace(/^\/uniswap/, '') + url.search

  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()
  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      'content-type': 'application/json',
      origin: 'https://app.uniswap.org',
      referer: 'https://app.uniswap.org/',
    },
    body,
  })

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  })
}
