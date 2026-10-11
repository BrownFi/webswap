import { describe, expect, it } from 'vitest'
import { switchChain } from '@wagmi/core'

import { availableChains, HEMI_CHAIN_ID, selectableChains, wagmiConfig } from './index'

describe('Hemi chain wiring', () => {
  // Hemi became a full BrownFi product chain in 2026-10 (BrownFi V3 deployed
  // alongside the pre-existing CLAMM product), so unlike before it IS part of
  // availableChains on the product envs. The invariant that still matters is
  // that it appears EXACTLY once in the selectable list: `selectableChains`
  // appends Hemi only on envs whose chain list lacks it (testnet), and a
  // regression there would render a duplicate Hemi row in the chain dropdown.
  it('exposes Hemi exactly once, appending it only when it is not a product chain', () => {
    expect(selectableChains.filter((chain) => chain.id === HEMI_CHAIN_ID)).toHaveLength(1)

    if (availableChains.some((chain) => chain.id === HEMI_CHAIN_ID)) {
      expect(selectableChains).toEqual(availableChains)
    } else {
      expect(selectableChains).toEqual([...availableChains, expect.objectContaining({ id: HEMI_CHAIN_ID })])
    }
  })

  it('keeps the product chains first and in order', () => {
    expect(selectableChains.slice(0, availableChains.length)).toEqual(availableChains)
  })

  it('can select Hemi as the disconnected wagmi read chain', async () => {
    const initialChainId = wagmiConfig.state.chainId

    try {
      await switchChain(wagmiConfig, { chainId: HEMI_CHAIN_ID })
      expect(wagmiConfig.state.chainId).toBe(HEMI_CHAIN_ID)
    } finally {
      await switchChain(wagmiConfig, { chainId: initialChainId })
    }
  })
})
