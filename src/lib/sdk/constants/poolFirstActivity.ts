// Manual per-pool "first activity" override — keyed by chain id, then LOWERCASE
// pair address.
//
// WHY: some pools are created well before their first trade. The annualized-
// return math (computeV3FeeApr) measures age from pool CREATION, so the idle
// period over-dilutes the return ("alive since creation" instead of "since first
// trade"). Add a pool here with the date its activity actually began — the first
// day the "Pool Balance Over Time" chart shows data — and the math trims the dead
// period.
//
// This is a FE stopgap. The clean fix is the indexer exposing a `firstActivityAt`
// field on the Pair entity; until then, only pools with a real creation→first-
// trade gap need an entry here.
//
// VALUE = ISO date `YYYY-MM-DD`, interpreted as 00:00 UTC.
export const POOL_FIRST_ACTIVITY: Record<number, Record<string, string>> = {
  // Bera Mainnet (80094) — 7 pools
  80094: {
    '0x16b3a5e95db753fe5195244fa208301e38beae2a': '2026-06-27', // DOLO/HONEY   ~$3.8k  (created Jun 12, gap 15d)
    '0x3e0fd2ce4d5b7e5f6c34e26c48a2dbd9f8d7d88c': '2026-06-11', // WBERA/HONEY  ~$18k   (created Jun 8,  gap 3d)
    '0x77ccfa7fdb7510e9ea1417c0737f856d87b5215d': '2026-06-17', // WBTC/WETH    ~$8.4k  (created Jun 12, gap 5d)
    '0x7d4ae0d663567b8caa0f0f4bd2585da7394943d7': '2026-06-17', // USDC.e/HONEY ~$12    (created Jun 8,  gap 9d)
    '0xc123bc9259d1a99add5a2c512498ac146dd2bade': '2026-06-04', // WETH/USDC.e  ~$18k   (traded from creation day)
    '0xe96e91374ac86a544ff0f9dc4eb9be6c1e37807d': '2026-06-19', // WETH/WBERA   ~$4.1k  (traded from creation day)
    '0xf2d50928f33ef0f9e8dc20881bc475de2c484e26': '2026-06-11', // USDC.e/WBERA ~$15.8k (created Jun 8,  gap 3d)
  },
  // HyperEVM (999) — 4 pools
  999: {
    '0x0ae102b0a525e5ac06bbda93de8d0cbcca62badf': '2026-06-10', // WHYPE/UBTC   ~$6.4k  (gap 1d)
    '0x2f4814ae38173eb2eefa20d02e8d1ff03cc0a174': '2026-06-10', // WHYPE/USDC   ~$1.9k  (gap 1d)
    '0x5e53a658646637bb7f36f01f32539280faf732cb': '2026-06-18', // USD₮0/kHYPE  ~$590   (gap 8d)
    '0x91ab7159210b8a79dadb486a0ad1e03ff786e151': '2026-06-11', // WHYPE/USD₮0  ~$27k   (gap 2d)
  },
  // Arbitrum (42161) — 3 pools (all created Jun 22, first trade Jun 23)
  42161: {
    '0x06a32f34fae5068040b8dcd6af41055196f93892': '2026-06-23', // WETH/USD₮0   ~$6.3k  (gap 1d)
    '0x6a06834df5bd2321bf892a1fbcb964467d3c17d7': '2026-06-23', // WBTC/USDC    ~$1.7k  (gap 1d)
    '0x6d0378f6f2ddc6e498c3105542e40206b0a4ec7d': '2026-06-23', // WBTC/USD₮0   ~$15    (gap 1d)
  },
  // Linea (59144) — 1 pool
  59144: {
    '0x16d4714566f2f5d0efe9642fe11ef48f8c192100': '2026-06-30', // USDC/WETH    ~$16    (created Jun 22, gap 8d)
  },
  // Base (8453) — indexer not reachable during the scan; add pools here when it's up.
}

/**
 * First-activity unix seconds for a pool, or `undefined` if no override is set.
 * Case-insensitive on the pair address (callers pass checksummed SDK addresses
 * or lowercase indexer ids).
 */
export function getPoolFirstActivity(chainId?: number | null, pairAddress?: string | null): number | undefined {
  if (!chainId || !pairAddress) return undefined
  const iso = POOL_FIRST_ACTIVITY[chainId]?.[pairAddress.toLowerCase()]
  if (!iso) return undefined
  const ms = Date.parse(`${iso}T00:00:00Z`)
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined
}

/**
 * Trim at the QUERY LAYER: inject a `<field>_gte: <firstActivity>` filter into a
 * GraphQL query's `where { … }` clause when the pool has a configured start date,
 * so the indexer returns only data from first activity onward (drops the pre-trade
 * dead period at the source — no client-side slicing). No override → query is
 * returned unchanged. `field` is the time key of the entity being queried:
 *   transactions → 'timestamp', pairDayData → 'dayStartUnix', pairHourData → 'hourStartUnix'.
 * The value is inlined (not a variable) because the indexer rejects a null `_gte`.
 */
export function withFirstActivityGte(
  template: string,
  field: 'timestamp' | 'dayStartUnix' | 'hourStartUnix',
  chainId?: number | null,
  pairAddress?: string | null,
): string {
  const start = getPoolFirstActivity(chainId, pairAddress)
  if (!start) return template
  return template.replace(/where:\s*\{/, `where: { ${field}_gte: ${start}, `)
}
