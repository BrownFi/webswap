import { describe, expect, it } from 'vitest'
import { PoolAggRow, volumeLegs } from './usePoolAggregates'

describe('volumeLegs', () => {
  const agg = { t: 100, buyVolume: 634.26, sellVolume: 120 } as PoolAggRow

  it('maps buyVolume to the up leg and sellVolume to the down leg', () => {
    expect(volumeLegs(agg)).toEqual([
      { t: 100, vol: 634.26, volUp: true },
      { t: 100, vol: 120, volUp: false },
    ])
  })

  it('does not flip on reversed pools: the indexer already splits on the base token', () => {
    // Linea USDC/WETH (quoteTokenIndex 0 → base = token1 WETH), 2026-10-29 05:00:
    // buyVolume 634.26 equalled the swaps that took WETH out of the pool. So a base
    // buy is buyVolume whichever side the base sits on — there is no orientation input.
    expect(volumeLegs.length).toBe(1)
    expect(volumeLegs(agg)[0]).toEqual({ t: 100, vol: 634.26, volUp: true })
  })
})
