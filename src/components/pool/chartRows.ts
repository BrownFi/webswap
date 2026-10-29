// Reading pairHour/DayData rows into chart points, shared by the Pool Detail charts.
//
// The charts plot the indexer's rows as they come. Note what that means for a quiet
// pool: before 2026-10-28 06:00 UTC the indexer only wrote a token's price when its
// oracle was written on-chain (by a swap), so an hour without one repeats the last
// price and its lines sit flat. Since then it prices quiet hours itself on Robinhood.
// The older rows can't be backfilled — the indexer only reads on-chain state — and
// filling them from an off-chain feed was tried and dropped (2026-10-29), so flat
// stretches in that history are the data, not a bug.

/** One point per aggregate bucket, carrying every line the LP chart draws. */
export type AggPoint = {
  t: number
  price0: number
  lpPrice?: number
  vol: number
  lpVsHodl: number | null
  lpVsUniV2: number | null
}

/** A pairHourData / pairDayData row as selected by the LP chart's query. */
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
}

type RowToPointArgs = {
  row: AggRow
  /** 0 when token0 is the base of the displayed relative price, 1 otherwise. */
  baseIdx: 0 | 1
  /** Whether the LP-vs-UniV2 line is drawn on this chain. */
  keepUniV2: boolean
  /** The one pool whose lpPrice is scaled by 1e9 (kHYPE/USDT). */
  scaleLpPriceDown?: boolean
}

/**
 * The LP chart's reading of one row. The benchmark lines compare $ VALUES at the
 * row's own prices — (tvl − benchmarkValue) / benchmarkValue — because a ratio of
 * per-token prices is only valid when the two supplies match, which UniV2's don't.
 */
export function rowToPoint({ row, baseIdx, keepUniV2, scaleLpPriceDown = false }: RowToPointArgs): AggPoint {
  const p0 = Number(row.token0Price) || 0
  const p1 = Number(row.token1Price) || 0
  const tvl = Number(row.tvl) || 0
  const bnhVal = (Number(row.bnhReserve0) || 0) * p0 + (Number(row.bnhReserve1) || 0) * p1
  const uniVal = (Number(row.uniV2Reserve0) || 0) * p0 + (Number(row.uniV2Reserve1) || 0) * p1

  // RELATIVE price = base priced in quote; token0Price/token1Price are USD unit prices.
  const baseUsd = baseIdx === 0 ? p0 : p1
  const quoteUsd = baseIdx === 0 ? p1 : p0

  const lpRaw = Number(row.lpPrice)
  const lpPrice = Number.isFinite(lpRaw) ? (scaleLpPriceDown ? lpRaw / 1e9 : lpRaw) : undefined

  return {
    t: Number(row.t),
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
  reserve0?: string
  reserve1?: string
  token0Price?: string
  token1Price?: string
  lpPrice?: string
  bnhPrice?: string
}

export type BalancePoint = {
  t: number
  pct0: number
  pct1: number
  price0: number
  lpVsBh: number | null
}

/**
 * The Pool Balance chart's reading of one row.
 *
 * Each side's USD value is reserve x price, computed here rather than read from the
 * row's own `reserve0USD`/`reserve1USD`. Those lag by an hour: in a bucket with no
 * swap the indexer values them at the PREVIOUS bucket's price, while `tvl` and
 * `token0Price` are current (191 of 193 quiet Robinhood rows on 2026-10-29, up to
 * 1.7% off on WETH/SPY). reserve x price matches `tvl` exactly.
 */
export function balanceRowToPoint(row: BalanceRow, baseIdx: 0 | 1): BalancePoint {
  const p0 = Number(row.token0Price) || 0
  const p1 = Number(row.token1Price) || 0
  const value0 = Number(row.reserve0) * p0
  const value1 = Number(row.reserve1) * p1
  const total = value0 + value1

  const baseUsd = baseIdx === 0 ? p0 : p1
  const quoteUsd = baseIdx === 0 ? p1 : p0

  const lp = Number(row.lpPrice)
  const bnh = Number(row.bnhPrice)

  return {
    t: Number(row.t),
    pct0: total > 0 ? (value0 / total) * 100 : NaN,
    pct1: total > 0 ? 100 - (value0 / total) * 100 : NaN,
    price0: quoteUsd > 0 ? baseUsd / quoteUsd : NaN,
    lpVsBh: lp > 0 && bnh > 0 ? (lp / bnh - 1) * 100 : null,
  }
}
