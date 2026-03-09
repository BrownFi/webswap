import { ChainId, ETHER, Token, WETH, CurrencyAmount, JSBI } from '@brownfi/sdk'
import { wrappedCurrency, wrappedCurrencyAmount, unwrappedToken } from './wrappedCurrency'

describe('wrappedCurrency', () => {
  const token = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 'TEST', 'Test Token')

  describe('wrappedCurrency', () => {
    it('returns WETH for ETHER', () => {
      const result = wrappedCurrency(ETHER, ChainId.MAINNET)
      expect(result).toEqual(WETH[ChainId.MAINNET])
    })

    it('returns the token itself for Token', () => {
      const result = wrappedCurrency(token, ChainId.MAINNET)
      expect(result).toEqual(token)
    })

    it('returns undefined for undefined currency', () => {
      expect(wrappedCurrency(undefined, ChainId.MAINNET)).toBeUndefined()
    })

    it('returns undefined for undefined chainId', () => {
      expect(wrappedCurrency(ETHER, undefined)).toBeUndefined()
    })

    it('returns undefined when both are undefined', () => {
      expect(wrappedCurrency(undefined, undefined)).toBeUndefined()
    })
  })

  describe('wrappedCurrencyAmount', () => {
    it('wraps ETHER amount to WETH amount', () => {
      const amount = CurrencyAmount.ether(JSBI.BigInt(1000))
      const result = wrappedCurrencyAmount(amount, ChainId.MAINNET)
      expect(result).toBeDefined()
      expect(result!.token).toEqual(WETH[ChainId.MAINNET])
      expect(result!.raw.toString()).toBe('1000')
    })

    it('returns undefined for undefined amount', () => {
      expect(wrappedCurrencyAmount(undefined, ChainId.MAINNET)).toBeUndefined()
    })

    it('returns undefined for undefined chainId', () => {
      const amount = CurrencyAmount.ether(JSBI.BigInt(1000))
      expect(wrappedCurrencyAmount(amount, undefined)).toBeUndefined()
    })
  })

  describe('unwrappedToken', () => {
    it('returns ETHER for WETH', () => {
      const weth = WETH[ChainId.MAINNET]
      expect(unwrappedToken(weth)).toBe(ETHER)
    })

    it('returns the token itself for non-WETH', () => {
      expect(unwrappedToken(token)).toBe(token)
    })
  })
})
