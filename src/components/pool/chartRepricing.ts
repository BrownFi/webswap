// Re-pricing the Pool Detail chart while a pool is quiet.
//
// pairHour/DayData does NOT stop when a pool stops trading — the indexer keeps
// emitting an hourly row. What freezes is the PRICE: `token0Price`/`token1Price`
// come from the on-chain oracle, which is only written by a swap. So a dead pool
// produces rows whose reserves are current but whose prices are days old, and every
// line on the chart flatlines (USDG/NVDA on Robinhood: last swap 2026-10-24, prices
// pinned at token1Price 211.5494 ever since).
//
// Note what does NOT freeze: reserves. Add/remove liquidity changes them without
// producing any volume — the same pool had 125.5 NVDA at its last swap and 10.6 two
// days later after a 42k LP burn. So a row can never be re-priced using some OTHER
// row's reserves; each row must be re-priced with its own.
//
// Hence: take each stale row's own reserves and apply the off-chain price for that
// row's hour. Liquidity events stay exactly where they happened, and the price line
// follows the real market path instead of a flat line. No bucket value is invented —
// reserves are on-chain facts and the price is the market's.
//
// Volume is never synthesised: there is no volume to report, and drawing bars would
// misstate the pool's activity.

/**
 * A pool counts as quiet once its last traded bucket is this far behind: one bucket
 * of the hourly aggregate, which is also the charts' bar-width floor.
 */
export const QUIET_AFTER_SECONDS = 60 * 60

/** One point per aggregate bucket, carrying every line the chart draws. */
export type AggPoint = {
  t: number
  price0: number
  lpPrice?: number
  vol: number
  lpVsHodl: number | null
  lpVsUniV2: number | null
}

/** A pairHourData / pairDayData row as selected by the chart's query. */
export type AggRow = {
  t: string
  tvl?: string
  totalVolume?: string
  lpPrice?: string
  bnhReserve0?: string
  bnhReserve1?: string
  token0Price?: string
  token1Price?: string
  uniV2Reserve0?: string
  uniV2Reserve1?: string
  // Only selected on chains opted in to re-pricing — needed to value a row's own
  // liquidity at a different price.
  reserve0?: string
  reserve1?: string
}

/**
 * The newest row that records a real observation, i.e. one with volume. Falls back
 * to the newest row when the pool has never traded, so callers always get an anchor.
 * `rows` need not be sorted.
 *
 * Used for STALENESS only: because a quiet pool still gets hourly rows, "newest row"
 * is always ~now and says nothing about whether the prices in it are current.
 */
export function pickLastTradedRow<T extends { t: string; totalVolume?: string }>(rows: T[]): T | null {
  let best: T | null = null
  let bestT = -Infinity
  let newest: T | null = null
  let newestT = -Infinity
  for (const row of rows) {
    const t = Number(row.t)
    if (!Number.isFinite(t)) continue
    if (t > newestT) {
      newestT = t
      newest = row
    }
    if (Number(row.totalVolume) > 0 && t > bestT) {
      bestT = t
      best = row
    }
  }
  return best ?? newest
}

/** `[unixSeconds, price]` samples, ascending. */
export type PriceSample = [number, number]

/**
 * Step lookup over a price series: the latest sample at or before `t`. Returns null
 * before the series starts, so callers can leave a row alone rather than back-fill it
 * with a price from the future.
 */
export function buildPriceLookup(samples: PriceSample[]): (t: number) => number | null {
  const asc = samples.filter(([t, p]) => Number.isFinite(t) && p > 0).sort((a, b) => a[0] - b[0])
  if (!asc.length) return () => null
  return (t: number) => {
    if (t < asc[0][0]) return null
    let lo = 0
    let hi = asc.length - 1
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2)
      if (asc[mid][0] <= t) lo = mid
      else hi = mid - 1
    }
    return asc[lo][1]
  }
}

type RowToPointArgs = {
  row: AggRow
  /** 0 when token0 is the base of the displayed relative price, 1 otherwise. */
  baseIdx: 0 | 1
  /** Whether the LP-vs-UniV2 line is drawn on this chain. */
  keepUniV2: boolean
  /** The one pool whose lpPrice is scaled by 1e9 (kHYPE/USDT). */
  scaleLpPriceDown?: boolean
  /** Off-chain prices to value this row at instead of its own frozen ones. */
  override?: { price0: number; price1: number } | null
}

/**
 * Turn one aggregate row into a chart point, optionally valuing it at off-chain
 * prices instead of the row's own. With no override this is the plain reading of the
 * row, so the same function serves fresh and stale rows alike.
 */
export function rowToPoint({
  row,
  baseIdx,
  keepUniV2,
  scaleLpPriceDown = false,
  override = null,
}: RowToPointArgs): AggPoint {
  const t = Number(row.t)
  const rowP0 = Number(row.token0Price) || 0
  const rowP1 = Number(row.token1Price) || 0
  const rowTvl = Number(row.tvl) || 0

  // Re-pricing needs the row's OWN reserves; without them, fall back to reading the
  // row as-is rather than valuing this liquidity at someone else's size.
  const r0 = Number(row.reserve0)
  const r1 = Number(row.reserve1)
  const canReprice =
    override != null && override.price0 > 0 && override.price1 > 0 && r0 > 0 && r1 > 0 && rowTvl > 0

  const p0 = canReprice ? override!.price0 : rowP0
  const p1 = canReprice ? override!.price1 : rowP1
  const tvl = canReprice ? r0 * p0 + r1 * p1 : rowTvl

  const bnhVal = (Number(row.bnhReserve0) || 0) * p0 + (Number(row.bnhReserve1) || 0) * p1
  const uniVal = (Number(row.uniV2Reserve0) || 0) * p0 + (Number(row.uniV2Reserve1) || 0) * p1

  const baseUsd = baseIdx === 0 ? p0 : p1
  const quoteUsd = baseIdx === 0 ? p1 : p0

  // Total supply doesn't change with price, so the LP price scales with TVL.
  const rowLp = Number(row.lpPrice)
  const lpBase = Number.isFinite(rowLp) ? rowLp : undefined
  const lpRaw = lpBase != null && canReprice && rowTvl > 0 ? lpBase * (tvl / rowTvl) : lpBase
  const lpPrice = lpRaw != null && scaleLpPriceDown ? lpRaw / 1e9 : lpRaw

  return {
    t,
    price0: quoteUsd > 0 ? baseUsd / quoteUsd : NaN,
    lpPrice,
    // Already a per-bucket USD sum, so no client-side summing is needed.
    vol: Number(row.totalVolume) || 0,
    lpVsHodl: bnhVal > 0 ? ((tvl - bnhVal) / bnhVal) * 100 : null,
    lpVsUniV2: keepUniV2 && uniVal > 0 ? ((tvl - uniVal) / uniVal) * 100 : null,
  }
}

/** A pairHour/DayData row as selected by the Pool Balance chart's query. */
export type BalanceRow = {
  t: string
  totalVolume?: string
  reserve0USD?: string
  reserve1USD?: string
  token0Price?: string
  token1Price?: string
  lpPrice?: string
  bnhPrice?: string
  bnhReserve0?: string
  bnhReserve1?: string
}

export type BalancePoint = {
  t: number
  pct0: number
  pct1: number
  price0: number
  lpVsBh: number | null
}

/**
 * The Pool Balance chart's reading of one row, optionally valued at off-chain prices.
 *
 * It carries `reserve0USD`/`reserve1USD` rather than token amounts, and those are
 * reserve x the frozen price — so a quiet pool's balance split, relative price and
 * LP-vs-BH line all sit still. Dividing the USD value back out by the row's own price
 * recovers the token amounts, which are the part that genuinely didn't move, and
 * those get valued at the off-chain price instead.
 *
 * lpPrice/bnhPrice are per-LP-token USD values, so they are rescaled by how much
 * their respective baskets moved, never recomputed from scratch.
 */
export function balanceRowToPoint(
  row: BalanceRow,
  baseIdx: 0 | 1,
  override: { price0: number; price1: number } | null = null,
): BalancePoint {
  const rowP0 = Number(row.token0Price) || 0
  const rowP1 = Number(row.token1Price) || 0
  const usd0 = Number(row.reserve0USD)
  const usd1 = Number(row.reserve1USD)

  const canReprice =
    override != null && override.price0 > 0 && override.price1 > 0 && rowP0 > 0 && rowP1 > 0

  const p0 = canReprice ? override!.price0 : rowP0
  const p1 = canReprice ? override!.price1 : rowP1
  // reserveUSD / price = the token amount, the quantity that a quiet pool holds fixed.
  const value0 = canReprice ? (usd0 / rowP0) * p0 : usd0
  const value1 = canReprice ? (usd1 / rowP1) * p1 : usd1
  const total = value0 + value1

  const baseUsd = baseIdx === 0 ? p0 : p1
  const quoteUsd = baseIdx === 0 ? p1 : p0

  const lp = Number(row.lpPrice)
  const bnh = Number(row.bnhPrice)
  let lpVsBh: number | null = lp > 0 && bnh > 0 ? (lp / bnh - 1) * 100 : null
  if (canReprice && lp > 0 && bnh > 0) {
    const bnh0 = Number(row.bnhReserve0) || 0
    const bnh1 = Number(row.bnhReserve1) || 0
    const bnhWas = bnh0 * rowP0 + bnh1 * rowP1
    const bnhNow = bnh0 * p0 + bnh1 * p1
    const lpWas = usd0 + usd1
    // Both baskets must be re-valuable, else the ratio would mix two instants.
    lpVsBh =
      bnhWas > 0 && lpWas > 0
        ? ((lp * (total / lpWas)) / (bnh * (bnhNow / bnhWas)) - 1) * 100
        : lpVsBh
  }

  return {
    t: Number(row.t),
    pct0: total > 0 ? (value0 / total) * 100 : NaN,
    pct1: total > 0 ? 100 - (value0 / total) * 100 : NaN,
    price0: quoteUsd > 0 ? baseUsd / quoteUsd : NaN,
    lpVsBh,
  }
}
