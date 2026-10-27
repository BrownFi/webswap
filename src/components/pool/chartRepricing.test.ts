import { describe, expect, it } from 'vitest'
import {
  AggRow,
  BalanceRow,
  balanceRowToPoint,
  buildOverrideResolver,
  buildPriceLookup,
  rowToPoint,
} from './chartRepricing'
import { daysForWindow, getCoinId } from './useTokenPriceHistory'

// Fixtures: USDG/NVDA on Robinhood (0x8825EDfF…), the pool that exposed the problem.
// Values copied verbatim from pairHourData.

// 2026-10-24 01:00 UTC — the pool's last swap. 125.5 NVDA of liquidity.
const TRADED_ROW: AggRow = {
  t: '1792803600',
  tvl: '47927.9746201601849256440265722',
  totalVolume: '687.8493021625236401388841111',
  lpPrice: '1.021734629789394170484784777307932',
  bnhReserve0: '23525.21607498970182715062902791534',
  bnhReserve1: '118.5512545176037841667678203797562',
  uniV2Reserve0: '23275.363379967148',
  uniV2Reserve1: '110.06264250702053',
  token0Price: '0.99997305',
  token1Price: '211.4680838',
  reserve0: '21387.288509',
  reserve1: '125.509542724600517119',
}

// 2026-10-27 05:00 UTC — no volume since, and a 42k LP burn happened on 10-25, so
// only 10.6 NVDA is left. Prices are still frozen at the 10-24 values.
const FROZEN_ROW: AggRow = {
  t: '1793077200',
  tvl: '4049.56079856371878051035209144',
  totalVolume: '0',
  lpPrice: '1.021949612458024798830379862426026',
  bnhReserve0: '1987.28931753908368303104445749847',
  bnhReserve1: '10.0146005432085778499742599244408',
  uniV2Reserve0: '1966.5667498461412',
  uniV2Reserve1: '9.295712165981108',
  token0Price: '0.9999673',
  token1Price: '211.54941203',
  reserve0: '1806.688188',
  reserve1: '10.602400960345824',
}

const BASE_IDX = 1 as const // NVDA (token1) priced in USDG (token0)

describe('buildPriceLookup', () => {
  const at = buildPriceLookup([
    [2000, 20],
    [1000, 10],
    [3000, 30],
  ])

  it('sorts the samples and returns the value at an exact stamp', () => {
    expect(at(1000)).toBe(10)
    expect(at(3000)).toBe(30)
  })

  it('steps: between samples it holds the earlier one', () => {
    expect(at(2999)).toBe(20)
  })

  it('holds the last sample after the series ends', () => {
    expect(at(999_999)).toBe(30)
  })

  it('returns null before the series starts rather than back-filling from the future', () => {
    expect(at(999)).toBeNull()
  })

  it('ignores non-positive prices and survives an empty series', () => {
    expect(buildPriceLookup([[1000, 0]])(2000)).toBeNull()
    expect(buildPriceLookup([])(1000)).toBeNull()
  })
})

describe('rowToPoint', () => {
  it('reads the row as-is with no override', () => {
    const p = rowToPoint({ row: FROZEN_ROW, baseIdx: BASE_IDX, keepUniV2: true })
    expect(p.price0).toBeCloseTo(211.56, 2) // the frozen relative price
    expect(p.lpPrice).toBeCloseTo(1.02195, 5)
    expect(p.vol).toBe(0)
  })

  it('re-prices a frozen row at the off-chain price', () => {
    const p = rowToPoint({
      row: FROZEN_ROW,
      baseIdx: BASE_IDX,
      keepUniV2: true,
      override: { price0: 0.99989022, price1: 215.78389913 },
    })
    expect(p.price0).toBeCloseTo(215.81, 2)
    expect(p.lpPrice).toBeCloseTo(1.0332, 4)
    expect(p.lpVsHodl).toBeCloseTo(-1.3, 1)
    expect(p.lpVsUniV2).toBeCloseTo(3.07, 1)
  })

  it.each([
    ['the traded row', TRADED_ROW],
    ['the frozen row', FROZEN_ROW],
  ])('re-pricing %s at its own prices is a no-op', (_label, row) => {
    // The sharp invariant: valuing a row at the prices it already carries must
    // reproduce it exactly. That only holds if the reserves used are the row's OWN.
    // The bug this guards took the last TRADED row's reserves (125.5 NVDA) and valued
    // them against the CURRENT tvl (post a 42k LP burn, 10.6 NVDA) — a 92% collapse
    // the pool never had. Liquidity moves without producing volume, so no row's
    // reserves may ever stand in for another's.
    const plain = rowToPoint({ row, baseIdx: BASE_IDX, keepUniV2: true })
    const repriced = rowToPoint({
      row,
      baseIdx: BASE_IDX,
      keepUniV2: true,
      override: { price0: Number(row.token0Price), price1: Number(row.token1Price) },
    })
    expect(repriced.price0).toBeCloseTo(plain.price0, 8)
    expect(repriced.lpPrice).toBeCloseTo(plain.lpPrice as number, 8)
    expect(repriced.lpVsHodl).toBeCloseTo(plain.lpVsHodl as number, 8)
    expect(repriced.lpVsUniV2).toBeCloseTo(plain.lpVsUniV2 as number, 8)
  })

  it('ignores the override entirely when the row has no reserves of its own', () => {
    // Chains whose indexer ships the narrower schema have no per-row reserves, so the
    // TVL-derived lines cannot be re-priced. Re-pricing is all-or-nothing on purpose:
    // moving the price line while LP vs. HODL stayed frozen would put two different
    // instants on the same chart. Such a row is read exactly as it is.
    const row: AggRow = { ...FROZEN_ROW, reserve0: undefined, reserve1: undefined }
    const p = rowToPoint({
      row,
      baseIdx: BASE_IDX,
      keepUniV2: true,
      override: { price0: 0.99989022, price1: 215.78389913 },
    })
    expect(p.price0).toBeCloseTo(211.56, 2)
    expect(p.lpPrice).toBeCloseTo(1.02195, 5)
  })

  it('never synthesises volume', () => {
    const p = rowToPoint({
      row: FROZEN_ROW,
      baseIdx: BASE_IDX,
      keepUniV2: true,
      override: { price0: 1, price1: 215 },
    })
    expect(p.vol).toBe(0)
  })

  it('leaves out the UniV2 line on chains that do not draw it', () => {
    const p = rowToPoint({ row: FROZEN_ROW, baseIdx: BASE_IDX, keepUniV2: false })
    expect(p.lpVsUniV2).toBeNull()
    expect(p.lpVsHodl).not.toBeNull()
  })

  it('ignores an override with a missing price', () => {
    const p = rowToPoint({
      row: FROZEN_ROW,
      baseIdx: BASE_IDX,
      keepUniV2: true,
      override: { price0: 0, price1: 215 },
    })
    expect(p.price0).toBeCloseTo(211.56, 2)
  })
})

describe('useTokenPriceHistory helpers', () => {
  it('clamps the window into CoinGecko hourly territory (2–90 days)', () => {
    // Below 2 days CoinGecko switches to 5-minute candles, past 90 days to daily —
    // both mismatch the chart's one-hour floor.
    expect(daysForWindow(3600)).toBe(2)
    expect(daysForWindow(3 * 86_400)).toBe(4)
    expect(daysForWindow(365 * 86_400)).toBe(90)
  })

  it('maps Robinhood tokens to coin ids, case-insensitively', () => {
    expect(getCoinId(4663, '0xD0601cE157dB5BdC3162bBac2a2c8AF5320d9eEC')).toBe('nvidia-xstock')
    expect(getCoinId(4663, '0x5fc5360d0400a0fd4f2af552add042d716f1d168')).toBe('global-dollar')
  })

  it('covers every token in every Robinhood pool (13 pairs, 12 tokens)', () => {
    // A missing id silently disables re-pricing for that pool, so the map is asserted
    // rather than left to be noticed on a chart.
    const robinhoodTokens = [
      '0x5fc5360d0400a0fd4f2af552add042d716f1d168', // USDG
      '0x0bd7d308f8e1639fab988df18a8011f41eacad73', // WETH
      '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', // NVDA
      '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea', // SPCX
      '0xec262a75e413fafd0df80480274532c79d42da09', // MSTR
      '0x117cc2133c37b721f49de2a7a74833232b3b4c0c', // SPY
      '0xff080c8ce2e5feadaca0da81314ae59d232d4afd', // MU
      '0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3', // GOOGL
      '0x020bfc650a365f8bb26819deaabf3e21291018b4', // CASHCAT
      '0x322f0929c4625ed5bad873c95208d54e1c003b2d', // TSLA
      '0xe93237c50d904957cf27e7b1133b510c669c2e74', // MSFT
      '0x39dbed3a2bd333467115de45665cc57f813c4571', // PONS
    ]
    for (const addr of robinhoodTokens) expect(getCoinId(4663, addr)).toBeTruthy()
  })

  it('returns undefined for unmapped tokens and chains', () => {
    expect(getCoinId(4663, '0x0000000000000000000000000000000000000001')).toBeUndefined()
    expect(getCoinId(80094, '0x5fc5360d0400a0fd4f2af552add042d716f1d168')).toBeUndefined()
    expect(getCoinId(4663, undefined)).toBeUndefined()
  })
})

describe('balanceRowToPoint', () => {
  // Same pool, same two hours. reserve0USD/reserve1USD are reserve x the frozen price.
  const ROW: BalanceRow = {
    t: '1793077200',
    totalVolume: '0',
    reserve0USD: '1806.6291',
    reserve1USD: '2242.9317',
    token0Price: '0.9999673',
    token1Price: '211.54941203',
    lpPrice: '1.021949612458024798830379862426026',
    bnhPrice: '1.036',
    bnhReserve0: '1987.28931753908368303104445749847',
    bnhReserve1: '10.0146005432085778499742599244408',
  }

  it('reads the row as-is with no override', () => {
    const p = balanceRowToPoint(ROW, BASE_IDX)
    expect(p.pct0).toBeCloseTo(44.61, 1) // the split the screenshot showed
    expect(p.price0).toBeCloseTo(211.56, 2)
  })

  it('re-pricing at the row\'s own prices is a no-op', () => {
    // Guards the same class of bug as the LP chart's: the token amounts must be
    // recovered from THIS row's reserveUSD/price, never borrowed from elsewhere.
    const plain = balanceRowToPoint(ROW, BASE_IDX)
    const same = balanceRowToPoint(ROW, BASE_IDX, {
      price0: Number(ROW.token0Price),
      price1: Number(ROW.token1Price),
    })
    expect(same.pct0).toBeCloseTo(plain.pct0, 8)
    expect(same.price0).toBeCloseTo(plain.price0, 8)
    expect(same.lpVsBh).toBeCloseTo(plain.lpVsBh as number, 8)
  })

  it('re-values BOTH sides, not just the one that moved', () => {
    // Doubling token0 must double its share of the pool's USD value. With USDG as
    // token0 a realistic move is ~0.01%, so a test using live prices cannot tell
    // whether side 0 was re-valued at all — this one can.
    const p = balanceRowToPoint(ROW, BASE_IDX, {
      price0: Number(ROW.token0Price) * 2,
      price1: Number(ROW.token1Price),
    })
    const usd0 = Number(ROW.reserve0USD)
    const usd1 = Number(ROW.reserve1USD)
    expect(p.pct0).toBeCloseTo(((usd0 * 2) / (usd0 * 2 + usd1)) * 100, 6)
  })

  it('moves the split and the price when the off-chain price differs', () => {
    // NVDA (token1) up ~2% → the pool holds relatively more USD value in token1.
    const p = balanceRowToPoint(ROW, BASE_IDX, { price0: 0.99989022, price1: 215.78389913 })
    const plain = balanceRowToPoint(ROW, BASE_IDX)
    expect(p.price0).toBeCloseTo(215.81, 2)
    expect(p.pct0).toBeLessThan(plain.pct0)
    expect(p.pct0 + p.pct1).toBeCloseTo(100, 8)
  })

  it('ignores the override when the row has no price to divide out', () => {
    // Without the row's own price the token amounts can't be recovered, so there is
    // nothing to re-value. The row is read raw rather than given a plausible-looking
    // number built from someone else's quantities.
    const broken: BalanceRow = { ...ROW, token1Price: '0' }
    const p = balanceRowToPoint(broken, BASE_IDX, { price0: 1, price1: 215 })
    const plain = balanceRowToPoint(broken, BASE_IDX)
    expect(p.pct0).toBeCloseTo(plain.pct0, 8)
    expect(p.price0).toBeCloseTo(plain.price0, 8)
  })
})

describe('buildOverrideResolver', () => {
  // A pool that traded at t=0 and again at t=200, with an idle stretch between.
  const rows = [
    { t: '0', totalVolume: '10', token0Price: '1', token1Price: '2000' },
    { t: '100', totalVolume: '0', token0Price: '1', token1Price: '2000' }, // frozen
    { t: '200', totalVolume: '5', token0Price: '1', token1Price: '2100' },
    { t: '300', totalVolume: '0', token0Price: '1', token1Price: '2100' }, // frozen
  ]
  // The off-chain feed sits 0.75% above the chain's price at every point — exactly the
  // offset measured between CoinGecko's ETH/USDG and the pool's own oracle.
  const OFFSET = 1.0075
  const feed1: Record<number, number> = { 0: 2000 * OFFSET, 100: 2050 * OFFSET, 200: 2100 * OFFSET, 300: 2200 * OFFSET }
  const at0 = () => 1
  const at1 = (t: number) => feed1[t] ?? null
  const resolve = buildOverrideResolver(rows, at0, at1)

  it('re-prices an INTERIOR gap, not just the trailing one', () => {
    // The bug this guards: only the stretch after the pool's LAST trade was treated as
    // stale, so a pool that traded on the 24th and again on the 26th showed the 25th
    // as a dead flat line.
    expect(resolve(100)).not.toBeNull()
  })

  it('carries the feed\'s relative move, not its absolute price', () => {
    // Chain said 2000 at the anchor and the feed rose 2.5% by t=100, so the bucket is
    // worth 2050 — NOT the feed's own 2065.4, which would jump by the source offset.
    expect(resolve(100)!.price1).toBeCloseTo(2050, 6)
    expect(resolve(100)!.price1).not.toBeCloseTo(2050 * OFFSET, 2)
  })

  it('introduces no jump at a gap boundary, whatever the source offset', () => {
    // Re-pricing the anchor itself must return exactly the chain's own price, so the
    // re-priced stretch joins the traded buckets continuously instead of sawtoothing.
    expect(resolve(0)!.price1).toBeCloseTo(2000, 9)
    expect(resolve(200)!.price1).toBeCloseTo(2100, 9)
  })

  it('anchors to the most recent trade before the bucket', () => {
    // t=300 follows the 2100 trade, so a 2200/2100 feed move lands at 2200 — if it had
    // anchored on the FIRST trade (2000) it would read 2200/2000 x 2000 = 2200 too,
    // so check a feed move that distinguishes them.
    const r = buildOverrideResolver(rows, at0, (t) => ({ 0: 1000, 200: 2000, 300: 3000 })[t] ?? null)
    // From the t=200 anchor (chain 2100) the feed tripled... no: 3000/2000 = 1.5x.
    expect(r(300)!.price1).toBeCloseTo(2100 * 1.5, 6)
  })

  it('leaves buckets before the first trade alone', () => {
    const r = buildOverrideResolver([{ t: '100', totalVolume: '1', token0Price: '1', token1Price: '2' }], at0, at1)
    expect(r(50)).toBeNull()
  })

  it('returns null when the feed has no sample for either end', () => {
    expect(resolve(999)).toBeNull() // no feed point at 999
    const r = buildOverrideResolver(rows, at0, (t) => (t === 100 ? 2050 : null))
    expect(r(100)).toBeNull() // feed has the bucket but not its anchor
  })

  it('returns null when nothing in the series ever traded', () => {
    const r = buildOverrideResolver([{ t: '0', totalVolume: '0', token0Price: '1', token1Price: '2' }], at0, at1)
    expect(r(0)).toBeNull()
  })
})
