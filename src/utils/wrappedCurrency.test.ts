import { ChainId, ETHER, WETH, Token, TokenAmount, CurrencyAmount, JSBI } from '@brownfi/sdk'
import { wrappedCurrency, wrappedCurrencyAmount, unwrappedToken } from './wrappedCurrency'

describe('wrappedCurrency', () => {
  describe('#wrappedCurrency', () => {
    it('wraps ETHER to WETH for the given chain', () => {
      const result = wrappedCurrency(ETHER, ChainId.MAINNET)
      expect(result).toBeDefined()
      expect(result!.equals(WETH[ChainId.MAINNET])).toBe(true)
    })

    it('returns WETH for ETHER on different chains', () => {
      const result = wrappedCurrency(ETHER, ChainId.BASE_MAINNET)
      expect(result).toBeDefined()
      expect(result!.equals(WETH[ChainId.BASE_MAINNET])).toBe(true)
    })

    it('returns the token itself if it is already a Token', () => {
      const token = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
      const result = wrappedCurrency(token, ChainId.MAINNET)
      expect(result).toBe(token)
    })

    it('returns undefined for undefined currency', () => {
      const result = wrappedCurrency(undefined, ChainId.MAINNET)
      expect(result).toBeUndefined()
    })

    it('returns undefined for undefined chainId with ETHER', () => {
      const result = wrappedCurrency(ETHER, undefined)
      expect(result).toBeUndefined()
    })
  })

  describe('#wrappedCurrencyAmount', () => {
    it('wraps an ETHER CurrencyAmount to a WETH TokenAmount', () => {
      const etherAmount = CurrencyAmount.ether(JSBI.BigInt('1000000000000000000')) // 1 ETH
      const result = wrappedCurrencyAmount(etherAmount, ChainId.MAINNET)
      expect(result).toBeDefined()
      expect(result!.token.equals(WETH[ChainId.MAINNET])).toBe(true)
      expect(result!.raw.toString()).toBe('1000000000000000000')
    })

    it('wraps a TokenAmount (returns same raw value with wrapped token)', () => {
      const token = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
      const tokenAmount = new TokenAmount(token, JSBI.BigInt('1000000'))
      const result = wrappedCurrencyAmount(tokenAmount, ChainId.MAINNET)
      expect(result).toBeDefined()
      expect(result!.token).toBe(token)
      expect(result!.raw.toString()).toBe('1000000')
    })

    it('returns undefined for undefined input', () => {
      const result = wrappedCurrencyAmount(undefined, ChainId.MAINNET)
      expect(result).toBeUndefined()
    })
  })

  describe('#unwrappedToken', () => {
    it('unwraps WETH to ETHER', () => {
      const weth = WETH[ChainId.MAINNET]
      const result = unwrappedToken(weth)
      expect(result).toBe(ETHER)
    })

    it('returns the token itself if not WETH', () => {
      const token = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
      const result = unwrappedToken(token)
      expect(result).toBe(token)
    })

    it('unwraps WETH on different chains', () => {
      const weth = WETH[ChainId.BASE_MAINNET]
      const result = unwrappedToken(weth)
      expect(result).toBe(ETHER)
    })
  })
})
