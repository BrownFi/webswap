import { CurrencyAmount, ETHER, JSBI, Token, TokenAmount, ChainId } from '@brownfi/sdk'
import { maxAmountSpend } from './maxAmountSpend'

// MIN_ETH = 10^16 = 0.01 ETH (same as constants/common)
const MIN_ETH = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16))

describe('maxAmountSpend', () => {
  it('returns undefined for undefined input', () => {
    expect(maxAmountSpend(undefined)).toBeUndefined()
  })

  it('subtracts MIN_ETH from ETHER balance when balance > MIN_ETH', () => {
    // 1 ETH = 10^18 wei
    const oneEther = CurrencyAmount.ether(JSBI.BigInt('1000000000000000000'))
    const result = maxAmountSpend(oneEther)
    expect(result).toBeDefined()
    // Should be 1 ETH - MIN_ETH (0.01 ETH = 10^16)
    const expected = JSBI.subtract(JSBI.BigInt('1000000000000000000'), MIN_ETH)
    expect(result!.raw.toString()).toBe(expected.toString())
    expect(result!.currency).toBe(ETHER)
  })

  it('returns 0 ETHER when balance <= MIN_ETH', () => {
    // 0.005 ETH = 5 * 10^15 wei, which is less than MIN_ETH (10^16)
    const smallEther = CurrencyAmount.ether(JSBI.BigInt('5000000000000000'))
    const result = maxAmountSpend(smallEther)
    expect(result).toBeDefined()
    expect(result!.raw.toString()).toBe('0')
  })

  it('returns 0 ETHER when balance equals MIN_ETH exactly', () => {
    const exactMinEther = CurrencyAmount.ether(MIN_ETH)
    const result = maxAmountSpend(exactMinEther)
    expect(result).toBeDefined()
    // MIN_ETH is not greater than MIN_ETH, so returns 0
    expect(result!.raw.toString()).toBe('0')
  })

  it('returns full amount for token (non-ETHER)', () => {
    const token = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
    const amount = new TokenAmount(token, JSBI.BigInt('1000000'))
    const result = maxAmountSpend(amount)
    expect(result).toBe(amount)
  })

  it('returns full amount for large token balance', () => {
    const token = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether')
    const largeAmount = new TokenAmount(token, JSBI.BigInt('999999999999'))
    const result = maxAmountSpend(largeAmount)
    expect(result).toBe(largeAmount)
  })
})
