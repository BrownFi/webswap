import { isUserRejection, parseZapError, isRouteStale } from './zapErrors'

describe('isUserRejection', () => {
  it('returns true for MetaMask rejection (code 4001)', () => {
    expect(isUserRejection({ code: 4001 })).toBe(true)
  })

  it('returns true for ethers ACTION_REJECTED', () => {
    expect(isUserRejection({ code: 'ACTION_REJECTED' })).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isUserRejection({ code: -32603 })).toBe(false)
    expect(isUserRejection({ message: 'some error' })).toBe(false)
    expect(isUserRejection({})).toBe(false)
  })
})

describe('parseZapError', () => {
  it('returns friendly message for execution reverted', () => {
    const msg = parseZapError({ reason: 'execution reverted' })
    expect(msg).toContain('slippage')
  })

  it('returns friendly message for insufficient output', () => {
    const msg = parseZapError({ reason: 'INSUFFICIENT_OUTPUT_AMOUNT' })
    expect(msg).toContain('slippage')
  })

  it('returns friendly message for expired transaction', () => {
    const msg = parseZapError({ reason: 'EXPIRED' })
    expect(msg).toContain('expired')
  })

  it('returns friendly message for transfer failed', () => {
    const msg = parseZapError({ reason: 'TRANSFER_FAILED' })
    expect(msg).toContain('balance')
  })

  it('returns friendly message for out of gas', () => {
    const msg = parseZapError({ message: 'out of gas' })
    expect(msg).toContain('gas')
  })

  it('returns friendly message for network error', () => {
    const msg = parseZapError({ message: 'NETWORK_ERROR' })
    expect(msg).toContain('Network')
  })

  it('returns friendly message for HTTP 500', () => {
    const msg = parseZapError({ message: 'HTTP 500' })
    expect(msg).toContain('unavailable')
  })

  it('returns friendly message for HTTP 429', () => {
    const msg = parseZapError({ message: 'HTTP 429' })
    expect(msg).toContain('failed')
  })

  it('returns friendly message for timeout/abort', () => {
    const msg = parseZapError({ message: 'The operation was aborted' })
    expect(msg).toContain('timed out')
  })

  it('returns reason string if no pattern matched', () => {
    const msg = parseZapError({ reason: 'Some custom reason' })
    expect(msg).toBe('Some custom reason')
  })

  it('truncates long messages', () => {
    const longMsg = 'a'.repeat(200)
    const msg = parseZapError({ message: longMsg })
    expect(msg.length).toBeLessThan(130)
    expect(msg).toContain('...')
  })

  it('handles null/undefined', () => {
    expect(parseZapError(null)).toContain('Unknown')
    expect(parseZapError(undefined)).toContain('Unknown')
  })

  it('reads from nested data.message', () => {
    const msg = parseZapError({ data: { message: 'execution reverted' } })
    expect(msg).toContain('slippage')
  })

  it('reads from nested error.message', () => {
    const msg = parseZapError({ error: { message: 'out of gas' } })
    expect(msg).toContain('gas')
  })
})

describe('isRouteStale', () => {
  it('returns false for fresh data', () => {
    expect(isRouteStale(Date.now())).toBe(false)
  })

  it('returns false for data within maxAge', () => {
    expect(isRouteStale(Date.now() - 30_000, 60_000)).toBe(false)
  })

  it('returns true for data older than maxAge', () => {
    expect(isRouteStale(Date.now() - 90_000, 60_000)).toBe(true)
  })

  it('defaults to 60s maxAge', () => {
    expect(isRouteStale(Date.now() - 61_000)).toBe(true)
    expect(isRouteStale(Date.now() - 59_000)).toBe(false)
  })
})
