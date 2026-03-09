import { Token, ChainId } from '@brownfi/sdk'
import { filterTokens } from './filtering'

describe('filterTokens', () => {
  const tokens = [
    new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
    new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
    new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin'),
    new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
  ]

  it('returns all tokens for empty search', () => {
    expect(filterTokens(tokens, '')).toEqual(tokens)
  })

  it('filters by symbol', () => {
    const result = filterTokens(tokens, 'USDC')
    expect(result).toHaveLength(1)
    expect(result[0].symbol).toBe('USDC')
  })

  it('filters by symbol case-insensitively', () => {
    const result = filterTokens(tokens, 'usdc')
    expect(result).toHaveLength(1)
    expect(result[0].symbol).toBe('USDC')
  })

  it('filters by name', () => {
    const result = filterTokens(tokens, 'Dai')
    expect(result).toHaveLength(1)
    expect(result[0].symbol).toBe('DAI')
  })

  it('filters by partial match', () => {
    const result = filterTokens(tokens, 'USD')
    expect(result).toHaveLength(2) // USDC and USDT
  })

  it('filters by address', () => {
    const result = filterTokens(tokens, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
    expect(result).toHaveLength(1)
    expect(result[0].symbol).toBe('USDC')
  })

  it('returns empty for no match', () => {
    const result = filterTokens(tokens, 'NONEXISTENT')
    expect(result).toHaveLength(0)
  })

  it('handles whitespace-only search', () => {
    const result = filterTokens(tokens, '   ')
    expect(result).toEqual(tokens)
  })
})
