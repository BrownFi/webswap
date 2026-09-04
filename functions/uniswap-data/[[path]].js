// Cloudflare Pages Function: same-origin proxy for the Uniswap Data API.
export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const target = 'https://entry-gateway.backend-prod.api.uniswap.org' + url.pathname.replace(/^\/uniswap-data/, '') + url.search
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
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=60' },
  })
}
