import { Token, ETHER, TokenAmount, ChainId } from '@brownfi/sdk'
import { tryParseAmount } from './hooks'

const TOKEN_18 = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'TEST', 'Test Token')
const TOKEN_6 = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')

describe('tryParseAmount', () => {
  it('returns undefined for empty value', () => {
    expect(tryParseAmount('', TOKEN_18)).toBeUndefined()
  })

  it('returns undefined for undefined value', () => {
    expect(tryParseAmount(undefined, TOKEN_18)).toBeUndefined()
  })

  it('returns undefined for undefined currency', () => {
    expect(tryParseAmount('1.0', undefined)).toBeUndefined()
  })

  it('returns undefined for zero value', () => {
    // parseUnits('0', 18) => '0', which triggers the '!== 0' check
    expect(tryParseAmount('0', TOKEN_18)).toBeUndefined()
  })

  it('parses a valid amount for an 18-decimal token', () => {
    const result = tryParseAmount('1.5', TOKEN_18)
    expect(result).toBeDefined()
    expect(result).toBeInstanceOf(TokenAmount)
    // 1.5 * 10^18 = 1500000000000000000
    expect(result!.raw.toString()).toBe('1500000000000000000')
  })

  it('parses a valid amount for a 6-decimal token', () => {
    const result = tryParseAmount('100', TOKEN_6)
    expect(result).toBeDefined()
    expect(result).toBeInstanceOf(TokenAmount)
    // 100 * 10^6 = 100000000
    expect(result!.raw.toString()).toBe('100000000')
  })

  it('parses ETHER (native currency) and returns CurrencyAmount', () => {
    const result = tryParseAmount('2.0', ETHER)
    expect(result).toBeDefined()
    // ETHER is not a Token instance, so it should be CurrencyAmount.ether
    expect(result!.raw.toString()).toBe('2000000000000000000')
    expect(result!.currency).toBe(ETHER)
  })

  it('returns undefined for too many decimal places', () => {
    // Token has 6 decimals, but value has 7+ decimals => parseUnits throws
    const result = tryParseAmount('1.1234567', TOKEN_6)
    expect(result).toBeUndefined()
  })

  it('returns undefined for invalid string', () => {
    const result = tryParseAmount('abc', TOKEN_18)
    expect(result).toBeUndefined()
  })

  it('parses very small amounts', () => {
    const result = tryParseAmount('0.000001', TOKEN_18)
    expect(result).toBeDefined()
    // 0.000001 * 10^18 = 1000000000000
    expect(result!.raw.toString()).toBe('1000000000000')
  })
})
