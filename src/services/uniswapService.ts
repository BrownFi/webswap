// Competitor Uniswap data for the pool list — Arbitrum and Robinhood.
// Uniswap's interface gateway (interface.gateway.uniswap.org) origin-allowlists:
// it 409s ACCESS_DENIED for brownfi.io origins (and no-origin), only allowing
// app.uniswap.org + localhost. So we go through a same-origin proxy that sets
// `Origin: https://app.uniswap.org` server-side: `/uniswap/*` → the gateway via
// functions/uniswap (CF Pages, beta/bera), api/uniswap (Vercel, dev), and
// vite.config server.proxy (local dev).
import { CompetitorPairData, CompetitorReference, competitorPairKey } from './competitorTypes'

// Same-origin proxy prefix (see functions/uniswap, vercel.json, vite.config).
const UNISWAP_PROXY_BASE = import.meta.env.VITE_UNISWAP_PROXY_BASE || '/uniswap'
const UNISWAP_LIQUIDITY_PROXY_BASE = import.meta.env.VITE_UNISWAP_LIQUIDITY_PROXY_BASE || '/uniswap-liquidity'
const UNISWAP_GRAPHQL_PATH = '/v1/graphql'
const UNISWAP_LIQUIDITY_PATH = '/uniswap.liquidity.v2.LiquidityService/GetPool'
const ROBINHOOD_WETH = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
const ROBINHOOD_PONS = '0x39dBED3a2bd333467115dE45665cC57F813C4571'
const ROBINHOOD_USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'
const ROBINHOOD_NVDA = '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC'
const ROBINHOOD_SPCX = '0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa'
const ROBINHOOD_SPY = '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C'
const ROBINHOOD_GOOGL = '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3'
const ROBINHOOD_MSTR = '0xec262a75e413fAfD0dF80480274532C79D42da09'
const ROBINHOOD_MU = '0xfF080c8ce2E5feadaCa0Da81314Ae59D232d4afD'
const ROBINHOOD_MSFT = '0xe93237C50D904957Cf27E7B1133b510C669c2e74'
const ROBINHOOD_TSLA = '0x322F0929c4625eD5bAd873c95208D54E1c003b2d'
const ROBINHOOD_CASHCAT = '0x020bfC650A365f8BB26819deAAbF3E21291018b4'
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

// One curated Uniswap reference per Robinhood pair. PairInfo oracle pools are the
// default source; curated V4 fallbacks are used when an oracle pool is not indexed
// by Uniswap or has insufficient liquidity for a useful comparison.
const ROBINHOOD_REFERENCE_POOLS = [
  [competitorPairKey(ROBINHOOD_WETH, ROBINHOOD_USDG), '0x52e65B17fB6E5BA00Ed806f37Afcd2DaA50271Ca'],
  [competitorPairKey(ROBINHOOD_USDG, ROBINHOOD_NVDA), '0xd4EB21209C4D6093f80B5b84f5C45cc093EA14a3'],
  [competitorPairKey(ROBINHOOD_SPCX, ROBINHOOD_USDG), '0xEb07d9587eFD1778dFb9c385Ec43EF6d5F9fE401'],
  [competitorPairKey(ROBINHOOD_SPY, ROBINHOOD_USDG), '0xe5923c8a8be481ec89a2ca784a2bbfa4235de6d88f92260fd66b660c4babf907'],
  [competitorPairKey(ROBINHOOD_WETH, ROBINHOOD_SPY), '0xDDCBBa3666f578E3F09516f21Ff85BFee859AB5e'],
  [competitorPairKey(ROBINHOOD_SPY, ROBINHOOD_GOOGL), '0xAFdFB72b9fa1F28d552BA1a88dB58ee522ed0803'],
  [competitorPairKey(ROBINHOOD_WETH, ROBINHOOD_SPCX), '0xC3c9F0171490Ef0F4536fe493F3b0EbB5ee0CB5e'],
  [competitorPairKey(ROBINHOOD_USDG, ROBINHOOD_MSTR), '0x319bac87e616a89e241c10aeb8afd4892a852cdd8b373cd9765ecddc40b87cfe'],
  [competitorPairKey(ROBINHOOD_USDG, ROBINHOOD_MU), '0xd057B1Bc54917855BBee58eAd58647f47caB35E5'],
  [competitorPairKey(ROBINHOOD_USDG, ROBINHOOD_MSFT), '0xeb60bCD1D920ad6E102690CCFC6fB488899E1510'],
  [competitorPairKey(ROBINHOOD_TSLA, ROBINHOOD_USDG), '0xf4ACdAEEB7022862A763C9B1B885e11191c889E3'],
  [competitorPairKey(ROBINHOOD_CASHCAT, ROBINHOOD_WETH), '0xd42A491087a15E5afd51FEb3606066Cc152d2b09'],
  [competitorPairKey(ROBINHOOD_PONS, ROBINHOOD_USDG), '0x7A192E71564ec66eE0763e328a3Ac274942dE4e1'],
] as const

const ROBINHOOD_UNISWAP_POOL_IDS = ROBINHOOD_REFERENCE_POOLS.map(([, poolId]) => poolId)
const ROBINHOOD_POOL_ORDER = new Map(ROBINHOOD_REFERENCE_POOLS.map(([key, poolId], index) => [`${key}:${poolId.toLowerCase()}`, index]))

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
    if (!res.ok) throw new Error(`Uniswap liquidity request failed: HTTP ${res.status}`)
    const json = (await res.json()) as { pools?: UniswapLiquidityPoolRaw[] }
    if (!Array.isArray(json.pools)) throw new Error('Uniswap liquidity response is invalid')
    return json.pools
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
      poolIdentifier: pool.poolIdentifier,
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
    const existing = map[key]
    map[key] = existing ? { ...existing, references: [...(existing.references ?? []), reference] } : { ...reference, references: [reference] }
  })
  Object.entries(map).forEach(([key, data]) => data.references?.sort((a, b) => {
    const aOrder = ROBINHOOD_POOL_ORDER.get(`${key}:${a.poolIdentifier?.toLowerCase()}`) ?? Number.MAX_SAFE_INTEGER
    const bOrder = ROBINHOOD_POOL_ORDER.get(`${key}:${b.poolIdentifier?.toLowerCase()}`) ?? Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  }))
  Object.entries(map).forEach(([key, data]) => {
    const references = data.references ?? []
    const selected = references.find((reference) => reference.version === 'V3') ?? references.find((reference) => reference.version === 'V4')
    if (selected) map[key] = { ...selected, references: [selected] }
  })
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
    if (!res.ok) throw new Error(`Uniswap GraphQL request failed: HTTP ${res.status}`)
    const json = (await res.json()) as { data?: { topV3Pools?: UniswapPoolRaw[] } }
    if (!json.data || !Array.isArray(json.data.topV3Pools)) throw new Error('Uniswap GraphQL response is invalid')
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
  } finally {
    clearTimeout(timeoutId)
  }
}
