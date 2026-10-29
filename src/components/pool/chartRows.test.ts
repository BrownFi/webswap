import { describe, expect, it } from 'vitest'
import { AggRow, BalanceRow, balanceRowToPoint, rowToPoint } from './chartRows'

// Fixture: USDG/NVDA on Robinhood (0x8825EDfF…), 2026-10-27 05:00 UTC. Values copied
// verbatim from pairHourData.
const ROW: AggRow = {
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
}

const BASE_IDX = 1 as const // NVDA (token1) priced in USDG (token0)

describe('rowToPoint', () => {
  it('reads the relative price, LP price and volume straight off the row', () => {
    const p = rowToPoint({ row: ROW, baseIdx: BASE_IDX, keepUniV2: true })
    expect(p.t).toBe(1793077200)
    expect(p.price0).toBeCloseTo(211.5563, 4) // NVDA in USDG = 211.549 / 0.99997
    expect(p.lpPrice).toBeCloseTo(1.02195, 5)
    expect(p.vol).toBe(0)
  })

  it('compares $ values against each benchmark at the row\'s own prices', () => {
    // (tvl − benchmark basket value) / benchmark basket value, both baskets valued at
    // the same token0Price/token1Price.
    const p = rowToPoint({ row: ROW, baseIdx: BASE_IDX, keepUniV2: true })
    expect(p.lpVsHodl).toBeCloseTo(-1.3699, 4)
    expect(p.lpVsUniV2).toBeCloseTo(2.9635, 4)
  })

  it('flips the relative price with the base token', () => {
    const p = rowToPoint({ row: ROW, baseIdx: 0, keepUniV2: true })
    expect(p.price0).toBeCloseTo(1 / 211.5563, 8)
  })

  it('leaves out the UniV2 line on chains that do not draw it', () => {
    const p = rowToPoint({ row: ROW, baseIdx: BASE_IDX, keepUniV2: false })
    expect(p.lpVsUniV2).toBeNull()
    expect(p.lpVsHodl).not.toBeNull()
  })

  it('scales kHYPE/USDT\'s lpPrice down by 1e9', () => {
    const p = rowToPoint({ row: ROW, baseIdx: BASE_IDX, keepUniV2: true, scaleLpPriceDown: true })
    expect(p.lpPrice).toBeCloseTo(1.021949612458e-9, 18)
  })

  it('returns no benchmark line rather than a division by zero', () => {
    const row: AggRow = { ...ROW, bnhReserve0: undefined, bnhReserve1: undefined, uniV2Reserve0: '0', uniV2Reserve1: '0' }
    const p = rowToPoint({ row, baseIdx: BASE_IDX, keepUniV2: true })
    expect(p.lpVsHodl).toBeNull()
    expect(p.lpVsUniV2).toBeNull()
  })
})

describe('balanceRowToPoint', () => {
  // Same pool and hour as ROW.
  const BALANCE: BalanceRow = {
    t: '1793077200',
    reserve0: '1806.688188',
    reserve1: '10.602400960345824',
    token0Price: '0.9999673',
    token1Price: '211.54941203',
    lpPrice: '1.021949612458024798830379862426026',
    bnhPrice: '1.036',
  }

  it('splits the pool by each side\'s USD value', () => {
    const p = balanceRowToPoint(BALANCE, BASE_IDX)
    expect(p.pct0).toBeCloseTo(44.613, 3)
    expect(p.pct0 + p.pct1).toBeCloseTo(100, 10)
    expect(p.price0).toBeCloseTo(211.5563, 4)
    expect(p.lpVsBh).toBeCloseTo(-1.3562, 4)
  })

  it('values each side at reserve x price, not the indexer\'s lagging reserveUSD', () => {
    // On a quiet hour the indexer's reserve0USD is valued at the PREVIOUS hour's price
    // (SPY/USDG 2026-10-28 20:00: usd sum 1002.69 = the 19:00 tvl, not 20:00's
    // 1001.41). Doubling token0's price must move the split exactly as reserve x price
    // says — which it could not if the value came from a stored USD field.
    const p = balanceRowToPoint({ ...BALANCE, token0Price: String(0.9999673 * 2) }, BASE_IDX)
    const usd0 = 1806.688188 * 0.9999673 * 2
    const usd1 = 10.602400960345824 * 211.54941203
    expect(p.pct0).toBeCloseTo((usd0 / (usd0 + usd1)) * 100, 9)
  })

  it('reports no split for a row without reserves, so the caller drops it', () => {
    const p = balanceRowToPoint({ ...BALANCE, reserve0: undefined, reserve1: undefined }, BASE_IDX)
    expect(Number.isFinite(p.pct0)).toBe(false)
  })

  it('returns no LP-vs-BH value when either price is missing', () => {
    expect(balanceRowToPoint({ ...BALANCE, bnhPrice: undefined }, BASE_IDX).lpVsBh).toBeNull()
    expect(balanceRowToPoint({ ...BALANCE, lpPrice: '0' }, BASE_IDX).lpVsBh).toBeNull()
  })
})
