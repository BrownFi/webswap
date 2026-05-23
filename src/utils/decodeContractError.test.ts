/**
 * Smoke tests for the contract-error decoder. Pinned a few representative
 * shapes from ethers v5 / viem / wagmi so any future change to the
 * extractor or registry catches regressions without needing a live RPC.
 */
import { describe, it, expect } from 'vitest'
import { decodeContractError } from './decodeContractError'

describe('decodeContractError', () => {
  it('decodes a V3 router custom error selector from ethers v5 shape', () => {
    const msg = decodeContractError({ code: 'CALL_EXCEPTION', data: '0xef71d091', reason: null })
    expect(msg).toMatch(/Insufficient token B amount/)
    expect(msg).toMatch(/slippage tolerance/i)
  })

  it('decodes a BrownFi V3 string revert via error.reason', () => {
    const msg = decodeContractError({ reason: 'BrownFiV3: INSUFFICIENT_INITIAL_VALUE' })
    expect(msg).toMatch(/Initial liquidity too low/)
    expect(msg).toMatch(/\$10/)
  })

  it('decodes a BrownFi V2 string revert', () => {
    const msg = decodeContractError({ reason: 'BrownFi: MAX_90_PERCENT_OF_RESERVE' })
    expect(msg).toMatch(/90%/)
  })

  it('decodes a UniswapV2-style string revert', () => {
    const msg = decodeContractError({ reason: 'UniswapV2: K' })
    expect(msg).toMatch(/invariant/i)
  })

  it('finds selector nested in cause.data (viem shape)', () => {
    const msg = decodeContractError({ cause: { data: '0x064a4ec6' } })
    expect(msg).toMatch(/Aggregator slippage exceeded/)
  })

  it('finds selector in info.error.data (wagmi shape)', () => {
    const msg = decodeContractError({ info: { error: { data: '0xef71d091abcdef' } } })
    expect(msg).toMatch(/Insufficient token B amount/)
  })

  it('extracts selector from raw message text as last resort', () => {
    const msg = decodeContractError({ message: 'execution reverted with 0x38aa5c15' })
    expect(msg).toMatch(/Price moved/)
  })

  it('returns undefined for user rejection (code 4001)', () => {
    expect(decodeContractError({ code: 4001 })).toBeUndefined()
  })

  it('returns undefined for user rejection by message ("user denied")', () => {
    expect(decodeContractError({ message: 'user denied transaction signature' })).toBeUndefined()
  })

  it('falls back to message + selector when selector is unknown', () => {
    const msg = decodeContractError({ code: 'CALL_EXCEPTION', data: '0xdeadbeef', message: 'unknown reason' })
    // Either includes the selector or the message — both acceptable; we just
    // care that the user gets something specific rather than a generic toast.
    expect(msg).toBeDefined()
    expect(msg!.length).toBeGreaterThan(0)
  })

  it('returns a generic fallback for empty error objects', () => {
    const msg = decodeContractError({}, 'Custom default')
    expect(msg).toBe('Custom default')
  })

  it('Kyber + BrownFiV3 share the Forbidden() selector — single registry entry covers both', () => {
    const msg = decodeContractError({ data: '0xee90c468' })
    expect(msg).toMatch(/Forbidden/i)
  })

  it('does not falsely match a string that happens to contain "user" without rejection wording', () => {
    const msg = decodeContractError({ message: 'user has insufficient balance' })
    expect(msg).toBeDefined()
    expect(msg).toMatch(/insufficient balance/i)
  })
})
