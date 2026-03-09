import isZero from './isZero'

describe('isZero', () => {
  it('returns true for 0x0', () => {
    expect(isZero('0x0')).toBe(true)
  })

  it('returns true for 0x with multiple zeros', () => {
    expect(isZero('0x00')).toBe(true)
    expect(isZero('0x000000')).toBe(true)
    expect(isZero('0x0000000000000000')).toBe(true)
  })

  it('returns false for non-zero hex', () => {
    expect(isZero('0x1')).toBe(false)
    expect(isZero('0x01')).toBe(false)
    expect(isZero('0x000001')).toBe(false)
    expect(isZero('0xabcdef')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isZero('')).toBe(false)
  })

  it('returns false for non-hex strings', () => {
    expect(isZero('abc')).toBe(false)
    expect(isZero('0')).toBe(false)
    // '0x' matches regex /^0x0*$/ (zero occurrences of '0' after '0x')
    expect(isZero('0x')).toBe(true)
  })
})
