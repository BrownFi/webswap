import { ChainId, JSBI, Pair, Percent, Route, Token, TokenAmount, Trade, TradeType } from '@brownfi/sdk'
import {
  computeTradePriceBreakdown,
  computeSlippageAdjustedAmounts,
  warningSeverity,
  warningSeveritySlippage,
  formatPrice,
  formatNumber,
} from './prices'
import { Field } from 'state/swap/actions'

describe('prices', () => {
  const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18)
  const token2 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18)
  const token3 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18)

  const pair12 = new Pair(new TokenAmount(token1, JSBI.BigInt(10000)), new TokenAmount(token2, JSBI.BigInt(20000)), 1)
  const pair23 = new Pair(new TokenAmount(token2, JSBI.BigInt(20000)), new TokenAmount(token3, JSBI.BigInt(30000)), 1)

  describe('computeTradePriceBreakdown', () => {
    it('returns undefined for undefined', () => {
      expect(computeTradePriceBreakdown(undefined)).toEqual({
        priceImpactWithoutFee: undefined,
        realizedLPFee: undefined,
      })
    })

    it('correct realized lp fee for single hop', () => {
      expect(
        computeTradePriceBreakdown(
          new Trade(new Route([pair12], token1), new TokenAmount(token1, JSBI.BigInt(1000)), TradeType.EXACT_INPUT),
        ).realizedLPFee,
      ).toEqual(new TokenAmount(token1, JSBI.BigInt(3)))
    })

    it('correct realized lp fee for double hop', () => {
      expect(
        computeTradePriceBreakdown(
          new Trade(
            new Route([pair12, pair23], token1),
            new TokenAmount(token1, JSBI.BigInt(1000)),
            TradeType.EXACT_INPUT,
          ),
        ).realizedLPFee,
      ).toEqual(new TokenAmount(token1, JSBI.BigInt(5)))
    })
  })

  describe('computeSlippageAdjustedAmounts', () => {
    it('returns undefined fields for undefined trade', () => {
      const result = computeSlippageAdjustedAmounts(undefined, 50)
      expect(result[Field.INPUT]).toBeUndefined()
      expect(result[Field.OUTPUT]).toBeUndefined()
    })

    it('computes slippage-adjusted amounts for a trade', () => {
      const trade = new Trade(
        new Route([pair12], token1),
        new TokenAmount(token1, JSBI.BigInt(1000)),
        TradeType.EXACT_INPUT,
      )
      const result = computeSlippageAdjustedAmounts(trade, 50) // 0.5% slippage
      expect(result[Field.INPUT]).toBeDefined()
      expect(result[Field.OUTPUT]).toBeDefined()
      // Max input should be >= trade input
      expect(JSBI.greaterThanOrEqual(result[Field.INPUT]!.raw, trade.inputAmount!.raw)).toBe(true)
    })
  })

  describe('warningSeverity', () => {
    const makePercent = (num: number, den: number) => new Percent(JSBI.BigInt(num), JSBI.BigInt(den))

    it('returns 0 for low price impact (<1%)', () => {
      expect(warningSeverity(makePercent(50, 10000))).toBe(0)
    })

    it('returns 1 for moderate price impact (1-3%)', () => {
      expect(warningSeverity(makePercent(200, 10000))).toBe(1)
    })

    it('returns 2 for medium price impact (3-5%)', () => {
      expect(warningSeverity(makePercent(400, 10000))).toBe(2)
    })

    it('returns 3 for high price impact (5-15%)', () => {
      expect(warningSeverity(makePercent(1000, 10000))).toBe(3)
    })

    it('returns 4 for blocked price impact (>15%)', () => {
      expect(warningSeverity(makePercent(2000, 10000))).toBe(4)
    })

    it('returns 4 for undefined', () => {
      expect(warningSeverity(undefined)).toBe(4)
    })
  })

  describe('warningSeveritySlippage', () => {
    it('returns 0 for slippage <= 1%', () => {
      expect(warningSeveritySlippage(0.5)).toBe(0)
      expect(warningSeveritySlippage(1)).toBe(0)
    })

    it('returns 1 for slippage 1-3%', () => {
      expect(warningSeveritySlippage(2)).toBe(1)
    })

    it('returns 2 for slippage 3-5%', () => {
      expect(warningSeveritySlippage(4)).toBe(2)
    })

    it('returns 3 for slippage 5-15%', () => {
      expect(warningSeveritySlippage(10)).toBe(3)
    })

    it('returns 4 for slippage >15%', () => {
      expect(warningSeveritySlippage(20)).toBe(4)
    })
  })

  describe('formatPrice', () => {
    it('formats small prices with decimals', () => {
      expect(formatPrice(1.5)).toContain('1.5')
    })

    it('formats large prices without decimals', () => {
      expect(formatPrice(5000)).toContain('5,000')
    })

    it('formats zero', () => {
      expect(formatPrice(0)).toContain('0')
    })
  })

  describe('formatNumber', () => {
    it('formats large numbers with commas', () => {
      expect(formatNumber('1234567')).toBe('1,234,567')
    })

    it('formats small numbers with decimals', () => {
      expect(formatNumber('0.123456')).toBe('0.123456')
    })

    it('handles null/undefined', () => {
      expect(formatNumber(null)).toBe('0')
      expect(formatNumber(undefined)).toBe('0')
    })
  })
})
