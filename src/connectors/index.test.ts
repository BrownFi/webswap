import { describe, expect, it } from 'vitest'
import { switchChain } from '@wagmi/core'

import { availableChains, HEMI_CHAIN_ID, selectableChains, wagmiConfig } from './index'

describe('Hemi chain isolation', () => {
  it('offers Hemi to wallets without exposing it to BrownFi product state', () => {
    expect(availableChains.some((chain) => chain.id === HEMI_CHAIN_ID)).toBe(false)
    expect(selectableChains.filter((chain) => chain.id === HEMI_CHAIN_ID)).toHaveLength(1)
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
