// Competitor Uniswap data for the pool list — Arbitrum and Robinhood.
// Uniswap's interface gateway (interface.gateway.uniswap.org) origin-allowlists:
// it 409s ACCESS_DENIED for brownfi.io origins (and no-origin), only allowing
// app.uniswap.org + localhost. So we go through a same-origin proxy that sets
// `Origin: https://app.uniswap.org` server-side: `/uniswap/*` → the gateway via
// functions/uniswap (CF Pages, beta/bera), api/uniswap (Vercel, dev), and
// vite.config server.proxy (local dev).
import { CompetitorPairData, CompetitorReference, competitorPairKey } from './competitors'

// Same-origin proxy prefix (see functions/uniswap, vercel.json, vite.config).
const UNISWAP_PROXY_BASE = import.meta.env.VITE_UNISWAP_PROXY_BASE || '/uniswap'
const UNISWAP_LIQUIDITY_PROXY_BASE = import.meta.env.VITE_UNISWAP_LIQUIDITY_PROXY_BASE || '/uniswap-liquidity'
const UNISWAP_GRAPHQL_PATH = '/v1/graphql'
const UNISWAP_LIQUIDITY_PATH = '/uniswap.liquidity.v2.LiquidityService/GetPool'
const ROBINHOOD_WETH = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
const ROBINHOOD_PONS = '0x39dBED3a2bd333467115dE45665cC57F813C4571'
const ROBINHOOD_USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'
const ROBINHOOD_MSTR = '0xec262a75e413fAfD0dF80480274532C79D42da09'
const PONS_USDG_KEY = competitorPairKey(ROBINHOOD_PONS, ROBINHOOD_USDG)
const PONS_WETH_KEY = competitorPairKey(ROBINHOOD_PONS, ROBINHOOD_WETH)
const MSTR_USDG_KEY = competitorPairKey(ROBINHOOD_MSTR, ROBINHOOD_USDG)
const PONS_WETH_REFERENCE = '0xed50bdeea8adc232f159486192a4157281d722ff'
const NATIVE_ETH = '0x0000000000000000000000000000000000000000'

// The explore-pools query app.uniswap.org uses. `feeTier` comes back in
// hundredths of a bip (500 = 0.05%) — already the unit CompetitorPairData wants.
// The gateway exposes no per-pool fees field, so we derive 24h fees as
// volume × feeTier / 1e6 (standard V3 fee math).
const TOP_V3_POOLS_QUERY = `query TopV3Pools($chain: Chain!, $first: Int!) {
  topV3Pools(first: $first, chain: $chain) {
    address
    feeTier
    totalLiquidity { value }
    volume24h: cumulativeVolume(duration: DAY) { value }
    token0 { address }
    token1 { address }
  }
}`

interface UniswapPoolRaw {
  feeTier: number
  totalLiquidity?: { value: number } | null
  volume24h?: { value: number } | null
  token0?: { address: string } | null
  token1?: { address: string } | null
}

interface UniswapLiquidityPoolRaw {
  poolIdentifier?: string
  protocolVersion?: 'V3' | 'V4'
  feeTier?: number
  isDynamicFee?: boolean
  tvlUsd?: number
  volumeUsd1d?: number
  token0Address?: string
  token1Address?: string
}

const ROBINHOOD_UNISWAP_POOL_IDS = [
  '0xd4EB21209C4D6093f80B5b84f5C45cc093EA14a3', '0x52e65B17fB6E5BA00Ed806f37Afcd2DaA50271Ca', '0x69BfaF19C9f377BB306a89aEd9F6B07e2c1a8d9a',
  '0xc61284332117c3FB23A2A56cceFFD07F7aF60029', '0xEb07d9587eFD1778dFb9c385Ec43EF6d5F9fE401', '0xDDCBBa3666f578E3F09516f21Ff85BFee859AB5e',
  '0xA43b424Bc609495AED4BCD88d654934b510B0aD9', '0xd057B1Bc54917855BBee58eAd58647f47caB35E5', '0xeb60bCD1D920ad6E102690CCFC6fB488899E1510',
  '0xf4ACdAEEB7022862A763C9B1B885e11191c889E3', '0x3bb34a44f1b2b5f32c034c38a53065a521a47b199700fa9bd19d60985ff24bf1',
  '0xe5923c8a8be481ec89a2ca784a2bbfa4235de6d88f92260fd66b660c4babf907', '0x2bca43d9d8c75399e3c6ba14e9dc88f44ca8968bb4694a8be4f80bd5a550df2e',
  '0xfe2a80bb5618fd14984b92ca6d45bf5ba67443ddb1435e28b2e48df2fc1526cd', '0x319bac87e616a89e241c10aeb8afd4892a852cdd8b373cd9765ecddc40b87cfe',
  '0x6fa3ee0048e78bf0a513eb0ab56f482944a767c21db990fcf555605e69f05659', '0x9194a557b6a6bb2236b49ea7e2bbccec5d3eeb705aef00903be4b3de1d949579',
  '0x8517f8071ae5b831b738052f12125e8e3d6c158b78728aa44ce3b25e5104d32e', '0xa92a3df27a00a276183ff7265fd8affa11df1fe8bb23ddfaf13f6c879a3f818b',
  '0xC3c9F0171490Ef0F4536fe493F3b0EbB5ee0CB5e', '0x17578C0e0D15da44f31677263114F71aE76653EA', '0xa6975f4720a95aa9cdfa9b010a065b0e941534c93f9fa708104c08f0ac029ca0',
  '0x4be9657ec9002e528f4f17a5c43edc525a07f888f7b180c2afbf75e096c4f38a', '0xEd50bDeeA8aDC232f159486192a4157281D722ff',
]

async function fetchUniswapLiquidityPools(): Promise<UniswapLiquidityPoolRaw[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20_000)
  try {
    const res = await fetch(`${UNISWAP_LIQUIDITY_PROXY_BASE}${UNISWAP_LIQUIDITY_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolIdentifiers: ROBINHOOD_UNISWAP_POOL_IDS, chainId: 4663 }),
      signal: controller.signal,
    })
    if (!res.ok) return []
    return ((await res.json()) as { pools?: UniswapLiquidityPoolRaw[] }).pools ?? []
  } catch {
    return []
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchUniswapRobinhoodPairMap(): Promise<Record<string, CompetitorPairData>> {
  const map: Record<string, CompetitorPairData> = {}
  const dataPools = await fetchUniswapLiquidityPools()
  dataPools.forEach((pool) => {
    if (!pool.token0Address || !pool.token1Address) return
    const version = pool.protocolVersion ?? 'V3'
    const feeTier = Number(pool.feeTier) || 0
    const isDynamicFee = pool.isDynamicFee === true
    const vol24hUSD = Number(pool.volumeUsd1d) || 0
    const reference: CompetitorReference = {
      version,
      feeTier,
      isDynamicFee,
      tvlUSD: Number(pool.tvlUsd) || 0,
      vol24hUSD,
      fees24hUSD: isDynamicFee ? 0 : (vol24hUSD * feeTier) / 1_000_000 || 0,
    }
    const token0Address = pool.token0Address.toLowerCase() === NATIVE_ETH ? ROBINHOOD_WETH : pool.token0Address
    const token1Address = pool.token1Address.toLowerCase() === NATIVE_ETH ? ROBINHOOD_WETH : pool.token1Address
    const key = competitorPairKey(token0Address, token1Address)
    // The MSTR/USDG comparison should use the two Uniswap V4 references;
    // exclude the legacy 1% V3 pool from the Stats card.
    if (key === MSTR_USDG_KEY && version === 'V3' && feeTier === 10000) return
    if (key === competitorPairKey('0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', '0x5fc5360D0400aFd4f2af552ADD042D716F1d168') && pool.poolIdentifier?.toLowerCase() !== '0xe5923c8a8be481ec89a2ca784a2bbfa4235de6d88f92260fd66b660c4babf907') return
    const mapKeys = key === PONS_WETH_KEY && pool.poolIdentifier?.toLowerCase() === PONS_WETH_REFERENCE
      ? [key, PONS_USDG_KEY]
      : [key]
    mapKeys.forEach((mapKey) => {
      const existing = map[mapKey]
      map[mapKey] = existing ? { ...existing, references: [...(existing.references ?? []), reference] } : { ...reference, references: [reference] }
    })
  })
  Object.values(map).forEach((data) => data.references?.sort((a, b) => a.version.localeCompare(b.version)))
  return map
}

// Returns a pair-keyed map. topV3Pools comes back sorted by TVL desc, so the
// first pool seen for a pair (highest TVL) wins when several fee tiers share it.
export async function fetchUniswapPairMap(): Promise<Record<string, CompetitorPairData>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(`${UNISWAP_PROXY_BASE}${UNISWAP_GRAPHQL_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: TOP_V3_POOLS_QUERY, variables: { chain: 'ARBITRUM', first: 50 } }),
      signal: controller.signal,
    })
    if (!res.ok) return {}
    const json = (await res.json()) as { data?: { topV3Pools?: UniswapPoolRaw[] } }
    const pools = json.data?.topV3Pools ?? []
    const map: Record<string, CompetitorPairData> = {}
    for (const p of pools) {
      if (!p.token0?.address || !p.token1?.address) continue
      const key = competitorPairKey(p.token0.address, p.token1.address)
      if (map[key]) continue // first (highest-TVL) pool per pair wins
      const feeTier = Number(p.feeTier) || 0
      const vol24hUSD = Number(p.volume24h?.value) || 0
      map[key] = {
        feeTier,
        tvlUSD: Number(p.totalLiquidity?.value) || 0,
        vol24hUSD,
        fees24hUSD: (vol24hUSD * feeTier) / 1_000_000,
      }
    }
    return map
  } catch {
    return {}
  } finally {
    clearTimeout(timeoutId)
  }
}
