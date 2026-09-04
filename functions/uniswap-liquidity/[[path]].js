const UPSTREAM = 'https://liquidity.backend-prod.api.uniswap.org/uniswap.liquidity.v2.LiquidityService/GetPool'
const ALLOWED_POOL_IDS = new Set([
  '0xd4EB21209C4D6093f80B5b84f5C45cc093EA14a3', '0x52e65B17fB6E5BA00Ed806f37Afcd2DaA50271Ca',
  '0xc61284332117c3FB23A2A56cceFFD07F7aF60029', '0xEb07d9587eFD1778dFb9c385Ec43EF6d5F9fE401',
  '0xDDCBBa3666f578E3F09516f21Ff85BFee859AB5e', '0xA43b424Bc609495AED4BCD88d654934b510B0aD9',
  '0xd057B1Bc54917855BBee58eAd58647f47caB35E5', '0xeb60bCD1D920ad6E102690CCFC6fB488899E1510',
  '0xf4ACdAEEB7022862A763C9B1B885e11191c889E3', '0x3bb34a44f1b2b5f32c034c38a53065a521a47b199700fa9bd19d60985ff24bf1',
  '0xe5923c8a8be481ec89a2ca784a2bbfa4235de6d88f92260fd66b660c4babf907', '0x2bca43d9d8c75399e3c6ba14e9dc88f44ca8968bb4694a8be4f80bd5a550df2e',
  '0xfe2a80bb5618fd14984b92ca6d45bf5ba67443ddb1435e28b2e48df2fc1526cd', '0x319bac87e616a89e241c10aeb8afd4892a852cdd8b373cd9765ecddc40b87cfe',
  '0x6fa3ee0048e78bf0a513eb0ab56f482944a767c21db990fcf555605e69f05659', '0x9194a557b6a6bb2236b49ea7e2bbccec5d3eeb705aef00903be4b3de1d949579',
  '0x8517f8071ae5b831b738052f12125e8e3d6c158b78728aa44ce3b25e5104d32e', '0xa92a3df27a00a276183ff7265fd8affa11df1fe8bb23ddfaf13f6c879a3f818b',
])

export async function onRequest(context) {
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const { poolIdentifiers, chainId } = await context.request.json()
  if (chainId !== 4663 || !Array.isArray(poolIdentifiers) || poolIdentifiers.length > 18 || poolIdentifiers.some((id) => typeof id !== 'string' || !ALLOWED_POOL_IDS.has(id))) return Response.json({ pools: [] }, { status: 400 })
  const pools = []
  for (let i = 0; i < poolIdentifiers.length; i += 4) {
    const batch = await Promise.all(poolIdentifiers.slice(i, i + 4).map(async (addressOrId) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8_000)
        const response = await fetch(UPSTREAM, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pool: { addressOrId, chainId } }), signal: controller.signal })
        clearTimeout(timeout)
        return response.ok ? (await response.json()).pool ?? null : null
      } catch { return null }
    }))
    pools.push(...batch.filter(Boolean))
  }
  return Response.json({ pools }, { headers: { 'cache-control': 'public, max-age=60' } })
}
