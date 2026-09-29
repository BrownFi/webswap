import { describe, expect, it } from 'vitest'

import { getDefaultChain } from 'connectors'
import { chainSlice, switchChain } from './chainSlice'

describe('chainSlice', () => {
  it('stores the default chain without viem methods', () => {
    const state = chainSlice.reducer(undefined, { type: 'init' })

    expect(state.id).toBe(getDefaultChain().id)
    expect('extend' in state).toBe(false)
  })

  it('removes non-serializable properties from switched chains', () => {
    const chain = { ...getDefaultChain(), extend: () => chain }
    const state = chainSlice.reducer(undefined, switchChain(chain))

    expect(state.id).toBe(chain.id)
    expect('extend' in state).toBe(false)
  })
})
