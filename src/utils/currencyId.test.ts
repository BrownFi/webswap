import { ETHER, Token, ChainId } from '@brownfi/sdk'
import { currencyId } from './currencyId'

describe('currencyId', () => {
  it('returns ETH for ETHER', () => {
    expect(currencyId(ETHER)).toBe('ETH')
  })

  it('returns address for Token', () => {
    const token = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
    expect(currencyId(token)).toBe('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
  })
})
