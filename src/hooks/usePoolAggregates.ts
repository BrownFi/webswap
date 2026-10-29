import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { graphqlFetcher } from 'utils/graphql'
import { withFirstActivityGte } from 'lib/sdk/constants/poolFirstActivity'

// Shared per-pool hourly + daily aggregates (pairHourData / pairDayData) for the Pool
// Balance and Oracle Spread charts. Both read the UNION of their columns under one
// react-query key per tier, so the page makes two requests in total.
//
// These replaced the per-swap `transactions` feed, which had to be paged 1000 rows at
// a time and resampled onto a time grid anyway. The aggregate carries the same
// quantities per bucket; what it gives up is detail finer than an hour (the oracle
// fields hold the LAST swap of each hour). Hourly covers the recent ~41 days (1000
// rows), daily the rest of the pool's history, so nothing needs paging on scroll.
//
// Every V3 chain on the beta API ships all of these fields (checked on Bera,
// Arbitrum, Linea, HyperEVM, Robinhood and Hemi, 2026-10-29). The charts are V3-only.

const FIELDS = `
          totalVolume
          buyVolume
          sellVolume
          reserve0
          reserve1
          token0Price
          token1Price
          lpPrice
          bnhPrice
          bh3Price
          pythPrice0
          pythPrice1
          ammPriceRel
          adjPriceRel
          kB
          kQ
          compress
          sSell
          sBuy
          pythWeight`

export type PoolAggRow = {
  t: number
  /**
   * USD volume of the bucket. buy/sell split it on the pool's BASE token (buy = base
   * bought): the indexer orients them by the pool's quoteTokenIndex, the same signal
   * the charts' `reversed` comes from — so they need no flipping.
   */
  totalVolume: number
  buyVolume: number
  sellVolume: number
  reserve0: number
  reserve1: number
  token0Price: number
  token1Price: number
  lpPrice: number
  bnhPrice: number
  bh3Price: number
  /**
   * Oracle-spread inputs as of the bucket's LAST swap. The indexer writes 0 (not
   * null) in a bucket without a swap, so a 0 here means "no reading", never a price.
   */
  pythPrice0: number
  pythPrice1: number
  ammPriceRel: number
  adjPriceRel: number
  kB: number
  kQ: number
  compress: number
  sSell: number
  sBuy: number
  pythWeight: number
}

type RawRow = { t: string } & Partial<Record<Exclude<keyof PoolAggRow, 't'>, string | null>>

const buildQuery = (entity: string, timeKey: 'hourStartUnix' | 'dayStartUnix') => `
  query PoolAgg($pair: String!) {
    rows: ${entity}(first: 1000, orderBy: ${timeKey}, orderDirection: desc, where: { pair: $pair }) {
          t: ${timeKey}${FIELDS}
    }
  }
`

const toRow = (r: RawRow): PoolAggRow => {
  const n = (v: string | null | undefined) => Number(v) || 0
  return {
    t: Number(r.t),
    totalVolume: n(r.totalVolume),
    buyVolume: n(r.buyVolume),
    sellVolume: n(r.sellVolume),
    reserve0: n(r.reserve0),
    reserve1: n(r.reserve1),
    token0Price: n(r.token0Price),
    token1Price: n(r.token1Price),
    lpPrice: n(r.lpPrice),
    bnhPrice: n(r.bnhPrice),
    bh3Price: n(r.bh3Price),
    pythPrice0: n(r.pythPrice0),
    pythPrice1: n(r.pythPrice1),
    ammPriceRel: n(r.ammPriceRel),
    adjPriceRel: n(r.adjPriceRel),
    kB: n(r.kB),
    kQ: n(r.kQ),
    compress: n(r.compress),
    sSell: n(r.sSell),
    sBuy: n(r.sBuy),
    pythWeight: n(r.pythWeight),
  }
}

/**
 * Both tiers per pool, each ascending, empty until BOTH have loaded (drawing whichever
 * lands first flashes a coarse daily-only chart before the hourly rows replace it).
 *
 * A chart reads ONE tier per range, never a mix: daily bars (ALL) the daily rows —
 * each a whole day's volume and close, and 1000 of them reach past every pool's
 * creation — and hourly-or-finer bars the hourly rows (~41 days). Joining the two
 * double-counted the seam day (USDG/NVDA 2026-09-17: 355k + 147k for a 355k day), and
 * a daily row on an hourly grid put a whole day's volume in one bar at 00:00.
 */
export function usePoolAggregates({
  pairAddress,
  chainId,
  version,
}: {
  pairAddress: string
  chainId: number
  version: number
}) {
  const pair = pairAddress?.toLowerCase()
  const tier = (entity: string, timeKey: 'hourStartUnix' | 'dayStartUnix') => ({
    queryKey: ['poolAgg', entity, chainId, pair, version],
    queryFn: async () => {
      const res = (await graphqlFetcher({
        operationName: 'PoolAgg',
        query: withFirstActivityGte(buildQuery(entity, timeKey), timeKey, chainId, pairAddress),
        variables: { chainId, version, pair },
      })) as { rows?: RawRow[] } | null
      return res?.rows ?? []
    },
    enabled: !!pair && !!chainId,
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
  const hour = useQuery<RawRow[]>(tier('pairHourDatas', 'hourStartUnix'))
  const day = useQuery<RawRow[]>(tier('pairDayDatas', 'dayStartUnix'))
  // Placeholder data counts as loaded, so on a pool switch one tier could land and be
  // joined with the OTHER tier's previous-pool placeholder. Hold until both are real.
  const isLoading = hour.isLoading || day.isLoading || hour.isPlaceholderData || day.isPlaceholderData

  const { dailyRows, hourlyRows } = useMemo<{ dailyRows: PoolAggRow[]; hourlyRows: PoolAggRow[] }>(() => {
    if (isLoading) return { dailyRows: [], hourlyRows: [] }
    // Drop any bucket dated in the future — a bad indexer record there stretches the
    // time axis to it. A 1h margin absorbs clock skew.
    const cutoff = Math.floor(Date.now() / 1000) + 3600
    const asc = (list: RawRow[] | undefined) =>
      (list ?? [])
        .map(toRow)
        .filter((r) => Number.isFinite(r.t) && r.t <= cutoff)
        .sort((a, b) => a.t - b.t)
    return { dailyRows: asc(day.data), hourlyRows: asc(hour.data) }
  }, [isLoading, hour.data, day.data])

  return { dailyRows, hourlyRows, isLoading }
}

/**
 * A bucket's volume as two legs, base bought (up/green) and base sold (down/red), so
 * the charts' signed-volume bucketing (height = gross, color = net direction) reads it
 * exactly as it read individual swaps.
 *
 * No flip for `reversed`: buyVolume/sellVolume are already base-oriented (verified
 * 2026-10-29 on reversed pools — Linea USDC/WETH, Bera WBTC/WETH — where buyVolume
 * equals the swaps that took token1 = WETH, the base, out of the pool).
 */
export function volumeLegs(row: PoolAggRow): { t: number; vol: number; volUp: boolean }[] {
  return [
    { t: row.t, vol: row.buyVolume, volUp: true },
    { t: row.t, vol: row.sellVolume, volUp: false },
  ]
}
