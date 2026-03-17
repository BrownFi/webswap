import { PairStats } from 'components/PositionCard/usePoolStats'

// Extract the pure logic for testing
const sortPairsByTvl = (pairs: PairStats[]) =>
  pairs.slice().sort((a, b) => b.tvl - a.tvl)

const filterPairs = (
  pairs: PairStats[],
  blocklist: Set<string>,
  allowedTokens: Set<string>,
  isMainnet: boolean,
) =>
  pairs.filter((pair) => {
    if (isMainnet) {
      if (blocklist.has(pair.id.toLowerCase())) return false
      const t0 = pair.token0?.id.toLowerCase()
      const t1 = pair.token1?.id.toLowerCase()
      return allowedTokens.has(t0!) || allowedTokens.has(t1!)
    }
    return true
  })

const makePair = (id: string, tvl: number, token0Id: string, token1Id: string): PairStats => ({
  id,
  fee: 0.003,
  protocolFee: 0.2,
  feeDay: 0,
  totalSupply: 100,
  reserve0: 50,
  reserve1: 50,
  tvl,
  apr: 5,
  volumeDay: 10,
  volume7Day: 70,
  updatedAt: Date.now() / 1000,
  token0: { id: token0Id, decimals: 18, name: 'A', price: 1, priceFeedId: '', symbol: 'A', totalSupply: 1000 },
  token1: { id: token1Id, decimals: 18, name: 'B', price: 1, priceFeedId: '', symbol: 'B', totalSupply: 1000 },
})

describe('Pool sorting', () => {
  it('sorts pairs by TVL descending', () => {
    const pairs = [
      makePair('0x1', 100, '0xa', '0xb'),
      makePair('0x2', 500, '0xa', '0xb'),
      makePair('0x3', 200, '0xa', '0xb'),
    ]
    const sorted = sortPairsByTvl(pairs)
    expect(sorted[0].tvl).toBe(500)
    expect(sorted[1].tvl).toBe(200)
    expect(sorted[2].tvl).toBe(100)
  })

  it('does not mutate original array', () => {
    const pairs = [
      makePair('0x1', 100, '0xa', '0xb'),
      makePair('0x2', 500, '0xa', '0xb'),
    ]
    const sorted = sortPairsByTvl(pairs)
    expect(pairs[0].tvl).toBe(100) // unchanged
    expect(sorted[0].tvl).toBe(500)
  })
})

describe('Pool filtering', () => {
  const blocklist = new Set(['0xblocked'])
  const allowedTokens = new Set(['0xa', '0xb'])

  it('filters blocked pairs on mainnet', () => {
    const pairs = [
      makePair('0xblocked', 100, '0xa', '0xb'),
      makePair('0x2', 200, '0xa', '0xb'),
    ]
    const filtered = filterPairs(pairs, blocklist, allowedTokens, true)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('0x2')
  })

  it('filters pairs without allowed tokens on mainnet', () => {
    const pairs = [
      makePair('0x1', 100, '0xunknown1', '0xunknown2'),
      makePair('0x2', 200, '0xa', '0xunknown'),
    ]
    const filtered = filterPairs(pairs, blocklist, allowedTokens, true)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('0x2')
  })

  it('allows all pairs on testnet', () => {
    const pairs = [
      makePair('0xblocked', 100, '0xunknown', '0xother'),
      makePair('0x2', 200, '0xunknown', '0xother'),
    ]
    const filtered = filterPairs(pairs, blocklist, allowedTokens, false)
    expect(filtered).toHaveLength(2)
  })

  it('allows pair if at least one token is in allowed set', () => {
    const pairs = [
      makePair('0x1', 100, '0xa', '0xrandom'),
    ]
    const filtered = filterPairs(pairs, blocklist, allowedTokens, true)
    expect(filtered).toHaveLength(1)
  })
})
