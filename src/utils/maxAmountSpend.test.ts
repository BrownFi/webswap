import { CurrencyAmount, JSBI, Token, TokenAmount, ChainId } from '@brownfi/sdk'
import { MIN_ETH } from 'constants/common'
import { maxAmountSpend } from './maxAmountSpend'

describe('maxAmountSpend', () => {
  it('returns undefined for undefined input', () => {
    expect(maxAmountSpend(undefined)).toBeUndefined()
  })

  it('returns full amount for token (non-ETH)', () => {
    const token = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 'TEST', 'Test')
    const amount = new TokenAmount(token, JSBI.BigInt('1000000000000000000')) // 1 token
    const result = maxAmountSpend(amount)
    expect(result).toBe(amount)
  })

  it('subtracts MIN_ETH from ETHER amount when balance > MIN_ETH', () => {
    const amount = CurrencyAmount.ether(JSBI.BigInt('1000000000000000000')) // 1 ETH
    const result = maxAmountSpend(amount)
    expect(result).toBeDefined()
    const expected = JSBI.subtract(JSBI.BigInt('1000000000000000000'), MIN_ETH)
    expect(result!.raw.toString()).toBe(expected.toString())
  })

  it('returns zero for ETHER amount <= MIN_ETH', () => {
    const amount = CurrencyAmount.ether(MIN_ETH)
    const result = maxAmountSpend(amount)
    expect(result).toBeDefined()
    expect(result!.raw.toString()).toBe('0')
  })

  it('returns zero for ETHER amount less than MIN_ETH', () => {
    const smallAmount = CurrencyAmount.ether(JSBI.BigInt('1000')) // very small
    const result = maxAmountSpend(smallAmount)
    expect(result).toBeDefined()
    expect(result!.raw.toString()).toBe('0')
  })
})
