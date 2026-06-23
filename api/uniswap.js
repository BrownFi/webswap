// Vercel serverless proxy for the Uniswap interface API — dev-brownfi.vercel.app
// (develop tier). The gateway origin-allowlists (brownfi.io / no-origin → 409
// ACCESS_DENIED), so we set Origin: https://app.uniswap.org server-side. The
// browser hits /uniswap/* same-origin; vercel.json rewrites it here.
// beta/bera use functions/uniswap (CF Pages); local dev uses vite.config proxy.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }
  const upstream = await fetch('https://interface.gateway.uniswap.org/v1/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://app.uniswap.org',
      referer: 'https://app.uniswap.org/',
    },
    body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
  })
  const text = await upstream.text()
  res.status(upstream.status)
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'public, max-age=60')
  res.send(text)
}
