import { isTradeBetter } from './trades'

describe('trades', () => {
  describe('#isTradeBetter', () => {
    it('returns false when tradeA exists but tradeB is undefined', () => {
      // We need a mock Trade-like object. Since isTradeBetter checks tradeA && !tradeB,
      // any truthy value works for the first branch.
      const mockTrade = {} as any
      expect(isTradeBetter(mockTrade, undefined)).toBe(false)
      expect(isTradeBetter(mockTrade, null)).toBe(false)
    })

    it('returns true when tradeB exists but tradeA is undefined', () => {
      const mockTrade = {} as any
      expect(isTradeBetter(undefined, mockTrade)).toBe(true)
      expect(isTradeBetter(null, mockTrade)).toBe(true)
    })

    it('returns undefined when both trades are undefined', () => {
      expect(isTradeBetter(undefined, undefined)).toBeUndefined()
    })

    it('returns undefined when both trades are null', () => {
      expect(isTradeBetter(null, null)).toBeUndefined()
    })
  })
})
