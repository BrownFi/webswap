// Vercel serverless proxy for the Uniswap Data API.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }
  const upstream = await fetch('https://entry-gateway.backend-prod.api.uniswap.org/data.v2.DataApiService/ListPools', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://app.uniswap.org',
      referer: 'https://app.uniswap.org/',
    },
    body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
  })
  res.status(upstream.status)
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'public, max-age=60')
  res.send(await upstream.text())
}
