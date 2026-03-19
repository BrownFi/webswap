import { Percent, JSBI } from '@brownfi/sdk'
import {
  warningSeverity,
  warningSeveritySlippage,
  formatPrice,
  formatNumber,
} from './prices'

describe('prices', () => {
  describe('#warningSeverity', () => {
    it('returns 4 for undefined price impact', () => {
      expect(warningSeverity(undefined)).toBe(4)
    })

    it('returns 0 for zero price impact', () => {
      const zero = new Percent(JSBI.BigInt(0), JSBI.BigInt(10000))
      expect(warningSeverity(zero)).toBe(0)
    })

    it('returns 0 for impact below 1%', () => {
      const half = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000)) // 0.5%
      expect(warningSeverity(half)).toBe(0)
    })

    it('returns 1 for impact between 1% and 3%', () => {
      const twoPercent = new Percent(JSBI.BigInt(200), JSBI.BigInt(10000))
      expect(warningSeverity(twoPercent)).toBe(1)
    })

    it('returns 2 for impact between 3% and 5%', () => {
      const fourPercent = new Percent(JSBI.BigInt(400), JSBI.BigInt(10000))
      expect(warningSeverity(fourPercent)).toBe(2)
    })

    it('returns 3 for impact between 5% and 15%', () => {
      const tenPercent = new Percent(JSBI.BigInt(1000), JSBI.BigInt(10000))
      expect(warningSeverity(tenPercent)).toBe(3)
    })

    it('returns 4 for impact >= 15%', () => {
      const twentyPercent = new Percent(JSBI.BigInt(2000), JSBI.BigInt(10000))
      expect(warningSeverity(twentyPercent)).toBe(4)
    })

    it('boundary: exactly 1% returns 1', () => {
      const onePercent = new Percent(JSBI.BigInt(100), JSBI.BigInt(10000))
      expect(warningSeverity(onePercent)).toBe(1)
    })

    it('boundary: exactly 3% returns 2', () => {
      const threePercent = new Percent(JSBI.BigInt(300), JSBI.BigInt(10000))
      expect(warningSeverity(threePercent)).toBe(2)
    })

    it('boundary: exactly 5% returns 3', () => {
      const fivePercent = new Percent(JSBI.BigInt(500), JSBI.BigInt(10000))
      expect(warningSeverity(fivePercent)).toBe(3)
    })

    it('boundary: exactly 15% returns 4', () => {
      const fifteenPercent = new Percent(JSBI.BigInt(1500), JSBI.BigInt(10000))
      expect(warningSeverity(fifteenPercent)).toBe(4)
    })
  })

  describe('#warningSeveritySlippage', () => {
    it('returns 0 for slippage <= 1', () => {
      expect(warningSeveritySlippage(0)).toBe(0)
      expect(warningSeveritySlippage(0.5)).toBe(0)
      expect(warningSeveritySlippage(1)).toBe(0)
    })

    it('returns 1 for slippage > 1 and <= 3', () => {
      expect(warningSeveritySlippage(1.5)).toBe(1)
      expect(warningSeveritySlippage(2)).toBe(1)
      expect(warningSeveritySlippage(3)).toBe(1)
    })

    it('returns 2 for slippage > 3 and <= 5', () => {
      expect(warningSeveritySlippage(3.5)).toBe(2)
      expect(warningSeveritySlippage(5)).toBe(2)
    })

    it('returns 3 for slippage > 5 and <= 15', () => {
      expect(warningSeveritySlippage(6)).toBe(3)
      expect(warningSeveritySlippage(10)).toBe(3)
      expect(warningSeveritySlippage(15)).toBe(3)
    })

    it('returns 4 for slippage > 15', () => {
      expect(warningSeveritySlippage(16)).toBe(4)
      expect(warningSeveritySlippage(100)).toBe(4)
    })
  })

  describe('#formatPrice', () => {
    it('formats zero as USD', () => {
      const result = formatPrice(0)
      expect(result).toContain('$')
      expect(result).toContain('0')
    })

    it('formats small numbers with up to 2 decimals', () => {
      const result = formatPrice(12.345)
      expect(result).toBe('$12.35')
    })

    it('formats large numbers with no decimals', () => {
      const result = formatPrice(5000)
      expect(result).toBe('$5,000')
    })

    it('defaults to 0 when called with no args', () => {
      const result = formatPrice()
      expect(result).toContain('$')
    })
  })

  describe('#formatNumber', () => {
    it('formats undefined as 0', () => {
      const result = formatNumber(undefined)
      expect(result).toContain('0')
    })

    it('formats null as 0', () => {
      const result = formatNumber(null)
      expect(result).toContain('0')
    })

    it('formats large numbers (>1000) with min 1 fraction digit', () => {
      const result = formatNumber('5000')
      expect(result).toBe('5,000')
    })

    it('formats medium numbers (>1) with min 2 fraction digits', () => {
      const result = formatNumber('50.123456')
      // minimumFractionDigits=2, Intl default maximumFractionDigits=3 for this range
      expect(result).toBe('50.123')
    })

    it('formats small numbers (<=1) with min 6 fraction digits', () => {
      const result = formatNumber('0.123456789')
      expect(result).toBe('0.123457')
    })

    it('accepts string values', () => {
      const result = formatNumber('1234')
      expect(result).toBe('1,234')
    })
  })
})
