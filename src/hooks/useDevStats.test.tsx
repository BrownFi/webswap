/**
 * Guards the indexer-staleness rule in useDevStats.
 *
 * Why: the dev-stats panel is what admins READ right before and after they
 * WRITE a pool parameter. It used to trust the indexer unconditionally, so on a
 * chain whose indexer had stopped (Robinhood, 3.6 days behind on 2026-10-21) a
 * successful setFeeOfPair kept showing the pre-write value and looked like it had
 * failed. Stale indexer data must now fall through to the on-chain read.
 */
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import dayjs from 'dayjs'

const v3ConfigQueryEnabled = vi.hoisted(() => ({ value: undefined as boolean | undefined }))

vi.mock('@tanstack/react-query', () => ({
  // Capture the `enabled` flag: that is what decides whether the on-chain
  // PairConfig read fires at all.
  useQuery: (opts: { enabled?: boolean }) => {
    v3ConfigQueryEnabled.value = opts.enabled
    return { data: undefined }
  },
}))
vi.mock('hooks', () => ({ useActiveWeb3React: () => ({ chainId: 4663 }) }))
vi.mock('./useVersion', () => ({ useVersion: () => ({ version: 4 }) }))
vi.mock('./useContract', () => ({ usePairV2Contract: () => null }))
vi.mock('state/multicall/hooks', () => ({ useSingleCallResult: () => ({ result: undefined }) }))
vi.mock('./useStorageCache', () => ({
  useStorageCache: () => ({ get: () => ({ fee: 0.0001 }), save: vi.fn() }),
}))

import { useDevStats } from './useDevStats'

const pair = { liquidityToken: { address: '0x9FAe770E44e64f22B4FD5C2974a78F067640C90B' } } as never

// Indexer projection needs kB or lambda present to count as populated at all.
const statsAt = (updatedAt: number) =>
  ({ updatedAt, kB: 0.003, lambda: 0.0005, fee: 0.0003 }) as never

describe('useDevStats indexer staleness', () => {
  it('uses the indexer while it is current', () => {
    const { result } = renderHook(() =>
      useDevStats({ pair, pairStats: statsAt(dayjs().subtract(5, 'minute').unix()) }),
    )
    expect(result.current?.fee).toBe(0.0003)
    // Fresh indexer → no on-chain read, the pool list stays on one GraphQL call.
    expect(v3ConfigQueryEnabled.value).toBe(false)
  })

  it('ignores a stale indexer and reads on-chain instead', () => {
    const { result } = renderHook(() =>
      useDevStats({ pair, pairStats: statsAt(dayjs().subtract(3, 'day').unix()) }),
    )
    // 0.0001 is the on-chain value from the storage cache, NOT the indexer's 0.0003.
    expect(result.current?.fee).toBe(0.0001)
    expect(v3ConfigQueryEnabled.value).toBe(true)
  })
})
