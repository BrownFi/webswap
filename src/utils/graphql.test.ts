import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChainId } from '@brownfi/sdk'

import { graphqlFetcher } from './graphql'
import { VERSION } from 'lib/sdk/constants/addresses'

const QUERY = 'query Pair($id: ID!) { pair(id: $id) { id } }'

describe('graphqlFetcher V3 indexer gating', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Base runs BrownFi V3 but its BE /indexer/v3 is not configured for chainId
  // 8453, so every V3 query there answers HTTP 500. Pool list and pool detail each
  // fan out several V3 queries, so a stray one is both noisy and slow — the fetch
  // must not happen at all. (Hemi was the example until its indexer went live.)
  it('makes no request for a V3 chain whose indexer is off', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const result = await graphqlFetcher({
      operationName: 'Pair',
      query: QUERY,
      variables: { chainId: ChainId.BASE_MAINNET, version: VERSION.V3_OFFICIAL, id: '0x0' },
    })

    expect(result).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('still queries a V3 chain whose indexer is live', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { pair: { id: '0xabc' } } }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await graphqlFetcher({
      operationName: 'Pair',
      query: QUERY,
      variables: { chainId: ChainId.BERA_MAINNET, version: VERSION.V3_OFFICIAL, id: '0xabc' },
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ pair: { id: '0xabc' } })
  })

  it('leaves non-V3 queries alone', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { pairs: [] } }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await graphqlFetcher({
      operationName: 'PairList',
      query: 'query PairList { pairs { id } }',
      variables: { chainId: ChainId.HEMI_MAINNET, version: VERSION.V2 },
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
