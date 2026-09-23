const UPSTREAM = 'https://liquidity.backend-prod.api.uniswap.org/uniswap.liquidity.v2.LiquidityService/GetPool'
const CHAIN_ID = 4663
const CACHE_TTL = 60_000
const cache = new Map()
const ALLOWED_POOL_IDS = new Set([
  '0xd4EB21209C4D6093f80B5b84f5C45cc093EA14a3', '0x52e65B17fB6E5BA00Ed806f37Afcd2DaA50271Ca', '0x69BfaF19C9f377BB306a89aEd9F6B07e2c1a8d9a',
  '0xc61284332117c3FB23A2A56cceFFD07F7aF60029', '0xEb07d9587eFD1778dFb9c385Ec43EF6d5F9fE401', '0xDDCBBa3666f578E3F09516f21Ff85BFee859AB5e',
  '0xA43b424Bc609495AED4BCD88d654934b510B0aD9', '0xd057B1Bc54917855BBee58eAd58647f47caB35E5', '0xeb60bCD1D920ad6E102690CCFC6fB488899E1510',
  '0xf4ACdAEEB7022862A763C9B1B885e11191c889E3', '0x3bb34a44f1b2b5f32c034c38a53065a521a47b199700fa9bd19d60985ff24bf1',
  '0xe5923c8a8be481ec89a2ca784a2bbfa4235de6d88f92260fd66b660c4babf907', '0x2bca43d9d8c75399e3c6ba14e9dc88f44ca8968bb4694a8be4f80bd5a550df2e',
  '0xfe2a80bb5618fd14984b92ca6d45bf5ba67443ddb1435e28b2e48df2fc1526cd', '0x319bac87e616a89e241c10aeb8afd4892a852cdd8b373cd9765ecddc40b87cfe',
  '0x6fa3ee0048e78bf0a513eb0ab56f482944a767c21db990fcf555605e69f05659', '0x9194a557b6a6bb2236b49ea7e2bbccec5d3eeb705aef00903be4b3de1d949579',
  '0x8517f8071ae5b831b738052f12125e8e3d6c158b78728aa44ce3b25e5104d32e', '0xa92a3df27a00a276183ff7265fd8affa11df1fe8bb23ddfaf13f6c879a3f818b',
  '0xC3c9F0171490Ef0F4536fe493F3b0EbB5ee0CB5e', '0xa6975f4720a95aa9cdfa9b010a065b0e941534c93f9fa708104c08f0ac029ca0',
  '0x4be9657ec9002e528f4f17a5c43edc525a07f888f7b180c2afbf75e096c4f38a', '0xEd50bDeeA8aDC232f159486192a4157281D722ff', '0xd42A491087a15E5afd51FEb3606066Cc152d2b09',
  '0xf6CBfc7baBd2Ba5BC24043fFe054a2e41447c4CE', '0xc89243f7e4ebE0b82D5F2B4158e2630A850c7fea', '0x03B28BcC56Cdf2F95E838fB0E0FF5Ce24801B264',
  '0xa7Bb1AC63BBaB0C44316E6c8C455213441689167', '0xAFdFB72b9fa1F28d552BA1a88dB58ee522ed0803', '0x8cCDC2c6875D0D1b59d0629F0576aE86ED5463a0',
  '0x17578C0e0D15da44f31677263114F71aE76653EA', '0x25C2dc3849B30ed4FbAb51B2256EB821C10D914f', '0x4D6D2662B543A1af352c706C2b2CE8f6535184A6',
  '0x51De2e69482fE24Cb882Ee0f1e358735A8354CB0', '0x7A192E71564ec66eE0763e328a3Ac274942dE4e1', '0xFc272671D7dB68CE4Bfa677c98044D6DbFaAa30B',
])
const ALLOWED_POOL_IDS_LOWER = new Set([...ALLOWED_POOL_IDS].map((id) => id.toLowerCase()))

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  let body
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body } catch { return res.status(400).json({ pools: [] }) }
  const { poolIdentifiers, chainId } = body ?? {}
  const normalizedPoolIds = Array.isArray(poolIdentifiers) ? [...new Set(poolIdentifiers.filter((id) => typeof id === 'string').map((id) => id.toLowerCase()))] : []
  if (chainId !== CHAIN_ID || !Array.isArray(poolIdentifiers) || poolIdentifiers.length > 30 || normalizedPoolIds.length !== poolIdentifiers.length || normalizedPoolIds.some((id) => !ALLOWED_POOL_IDS_LOWER.has(id))) return res.status(400).json({ pools: [] })
  const cacheKey = normalizedPoolIds.slice().sort().join(',')
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return res.status(200).setHeader('cache-control', 'public, max-age=60').json(cached.body)
  const pools = (await Promise.all(normalizedPoolIds.map(async (addressOrId) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)
    try {
      const response = await fetch(UPSTREAM, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pool: { addressOrId, chainId } }), signal: controller.signal })
      return response.ok ? (await response.json()).pool ?? null : null
    } catch { return null } finally { clearTimeout(timeout) }
  }))).filter(Boolean)
  const responseBody = { pools }
  cache.set(cacheKey, { body: responseBody, expiresAt: Date.now() + CACHE_TTL })
  return res.status(200).setHeader('cache-control', 'public, max-age=60').json(responseBody)
}
