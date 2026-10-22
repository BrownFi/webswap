/**
 * getReadOnlyProvider backs the multicall contract, so every balance, allowance
 * and reserve read in the app flows through it. It used to pin rpcUrls[0] with no
 * retry and no rotation: one wobbly node and reads hang forever, which surfaces as
 * ApprovalState.UNKNOWN — a greyed-out "Approve" button that does nothing when
 * clicked (reported on Robinhood 2026-10-22). These tests pin the rotation.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FallbackProvider, StaticJsonRpcProvider } from '@ethersproject/providers'

const rpcUrls = vi.hoisted(() => ({ value: [] as string[] }))

vi.mock('lib/sdk/rpc', () => ({ rpcUrlsFor: () => rpcUrls.value }))
vi.mock('connectors', () => ({
  availableChains: [{ id: 4663, rpcUrls: { default: { http: ['https://from-connectors.example'] } } }],
}))

import { getReadOnlyProvider } from './ethersAdapter'

// The module caches one provider per chain, so each case needs its own chain id.
let nextChainId = 900000

afterEach(() => {
  rpcUrls.value = []
})

describe('getReadOnlyProvider', () => {
  it('spreads across every configured RPC so a dead node can be rotated past', () => {
    rpcUrls.value = ['https://a.example', 'https://b.example', 'https://c.example']
    const provider = getReadOnlyProvider(nextChainId++ as never) as FallbackProvider

    expect(provider).toBeInstanceOf(FallbackProvider)
    expect(provider.providerConfigs).toHaveLength(3)
    // quorum 1: the first node to answer wins — these are plain reads, there is
    // nothing to be gained by making several nodes agree.
    expect(provider.quorum).toBe(1)
    // A slow node must not be waited out indefinitely.
    provider.providerConfigs.forEach((c) => expect(c.stallTimeout).toBeGreaterThan(0))
    // Configured order is the preference order.
    expect(provider.providerConfigs.map((c) => c.priority)).toEqual([1, 2, 3])
  })

  it('stays a plain provider when the chain only has one RPC', () => {
    rpcUrls.value = ['https://only.example']
    const provider = getReadOnlyProvider(nextChainId++ as never)

    expect(provider).toBeInstanceOf(StaticJsonRpcProvider)
    expect((provider as StaticJsonRpcProvider).connection.url).toBe('https://only.example')
  })

  it('falls back to the connectors chain list when no RPC is configured', () => {
    rpcUrls.value = []
    const provider = getReadOnlyProvider(4663 as never) as StaticJsonRpcProvider

    expect(provider.connection.url).toBe('https://from-connectors.example')
  })

  it('caches one provider per chain', () => {
    rpcUrls.value = ['https://a.example', 'https://b.example']
    const chainId = nextChainId++ as never
    expect(getReadOnlyProvider(chainId)).toBe(getReadOnlyProvider(chainId))
  })
})
