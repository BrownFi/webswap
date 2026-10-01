import { describe, expect, it } from 'vitest'

import { isValidNordsternTransaction, NORDSTERN_ROUTER, NordsternQuote } from '@clmm/config/nordstern'
import { getTransactionDeadline } from '@clmm/utils/common/getTransactionDeadline'
import { pairSuccessfulPositionResults } from '@clmm/utils/positions/pairSuccessfulPositionResults'

const chainId = 43111
const account = '0x6369D6BE96B2B36FC30fB033703B3829a938b975'
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const outputToken = '0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA'

function uint128(value: bigint) {
  return value.toString(16).padStart(32, '0')
}

function address(value: string) {
  return value.slice(2).toLowerCase()
}

function nordsternCalldata(amountIn = 100n, minAmountOut = 90n, tokenIn = nativeToken) {
  const executor = '0xe578184bc88eb48485bba23a37b5509578d2ae38'
  return `0x3f0bde250000${address(executor)}${uint128(amountIn)}${uint128(minAmountOut)}00${address(executor)}${address(account)}${address(tokenIn)}${address(outputToken)}` as `0x${string}`
}

function nordsternQuote(overrides: Partial<NordsternQuote> = {}): NordsternQuote {
  return {
    chainId,
    amountIn: 100n,
    tokenInIsNative: true,
    from: account,
    tokenIn: nativeToken,
    tokenOut: outputToken,
    toAmount: 95n,
    minToAmount: 90n,
    gasEstimate: 1n,
    tx: {
      to: NORDSTERN_ROUTER[chainId],
      value: 100n,
      data: nordsternCalldata(),
    },
    ...overrides,
  }
}

describe('CLMM transaction safety', () => {
  it('creates deadlines in epoch seconds', () => {
    expect(getTransactionDeadline(180, 1_700_000_000_999)).toBe(1_700_000_180)
  })

  it('preserves token IDs when an earlier position call fails', () => {
    const paired = pairSuccessfulPositionResults(
      [{ error: new Error('RPC failure') }, { result: 'position-11' }, { result: 'position-12' }],
      [10n, 11n, 12n],
    )

    expect(paired).toEqual([
      { result: 'position-11', tokenId: 11n },
      { result: 'position-12', tokenId: 12n },
    ])
  })

  it('accepts only the configured Nordstern router and expected native value', () => {
    expect(isValidNordsternTransaction(nordsternQuote())).toBe(true)
    expect(
      isValidNordsternTransaction(
        nordsternQuote({
          tx: {
            to: '0x0000000000000000000000000000000000000001',
            value: 100n,
            data: nordsternCalldata(),
          },
        }),
      ),
    ).toBe(false)
    expect(
      isValidNordsternTransaction(
        nordsternQuote({
          tx: { to: NORDSTERN_ROUTER[chainId], value: 101n, data: nordsternCalldata() },
        }),
      ),
    ).toBe(false)
  })

  it('requires zero value for ERC20 input and valid output bounds', () => {
    expect(
      isValidNordsternTransaction(
        nordsternQuote({
          tokenInIsNative: false,
          tokenIn: '0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e',
          tx: { to: NORDSTERN_ROUTER[chainId], value: 100n, data: nordsternCalldata() },
        }),
      ),
    ).toBe(false)
    expect(
      isValidNordsternTransaction(
        nordsternQuote({
          tokenInIsNative: false,
          tokenIn: '0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e',
          tx: {
            to: NORDSTERN_ROUTER[chainId],
            value: 0n,
            data: nordsternCalldata(100n, 90n, '0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e'),
          },
        }),
      ),
    ).toBe(true)
    expect(isValidNordsternTransaction(nordsternQuote({ minToAmount: 96n }))).toBe(false)
    expect(
      isValidNordsternTransaction(
        nordsternQuote({
          tx: { to: NORDSTERN_ROUTER[chainId], value: 100n, data: '0x' },
        }),
      ),
    ).toBe(false)
  })
})
