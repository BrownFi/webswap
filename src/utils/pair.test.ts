import { shouldReverse } from './pair'

describe('shouldReverse', () => {
  it('returns true for pairs in the reverse list', () => {
    expect(shouldReverse('USDC.e/BERA')).toBe(true)
    expect(shouldReverse('USDC/cbBTC')).toBe(true)
    expect(shouldReverse('USDT/kHYPE')).toBe(true)
    expect(shouldReverse('USDC/ETH')).toBe(true)
    expect(shouldReverse('USDC/BNB')).toBe(true)
    expect(shouldReverse('USDT/BNB')).toBe(true)
    expect(shouldReverse('AUSD/MON')).toBe(true)
  })

  it('returns false for pairs not in the reverse list', () => {
    expect(shouldReverse('ETH/USDC')).toBe(false)
    expect(shouldReverse('BNB/USDT')).toBe(false)
    expect(shouldReverse('WETH/DAI')).toBe(false)
    expect(shouldReverse('')).toBe(false)
  })

  it('is case-sensitive', () => {
    expect(shouldReverse('usdc/eth')).toBe(false)
    expect(shouldReverse('USDC/eth')).toBe(false)
  })
})
