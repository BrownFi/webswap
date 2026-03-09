import listVersionLabel from './listVersionLabel'

describe('listVersionLabel', () => {
  it('formats version correctly', () => {
    expect(listVersionLabel({ major: 1, minor: 0, patch: 0 })).toBe('v1.0.0')
  })

  it('handles multi-digit version numbers', () => {
    expect(listVersionLabel({ major: 2, minor: 15, patch: 3 })).toBe('v2.15.3')
  })

  it('handles zero version', () => {
    expect(listVersionLabel({ major: 0, minor: 0, patch: 0 })).toBe('v0.0.0')
  })
})
