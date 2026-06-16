import { ChainId } from '@brownfi/sdk'
import { isV3Like, useV3Indexer } from 'lib/sdk/constants/addresses'

export const graphqlFetcher = async ({
  operationName,
  query,
  variables,
}: {
  operationName: string
  query: string
  // `variables.version` (optional) routes the query: version === 3 → /indexer/v3,
  // otherwise → /indexer. Both `chainId` and `version` are stripped before send.
  variables: object
}) => {
  const { chainId, version, ...restVar } = variables as { chainId: number; version?: number }
  if (chainId !== ChainId.BERA_MAINNET) {
    query = query.replace(/stakeLP/g, '')
  }
  // V3-gen routing per (chain, version):
  // - V3 Pilot (version 3): standard VITE_API_URL/indexer/v3 — the beta-api
  //   multi-chain indexer tracks the pilot factory (Bera 0x83A329E9).
  // - V3 Official (version 4): Bera uses the Goldsky override
  //   (VITE_INDEXER_V3_URL, which indexes the v3-final factory 0x6Ccf36d3);
  //   HyperEVM falls through to VITE_API_URL/indexer/v3 (the BE multi-chain
  //   indexer tracks the official HL factory). The override is OFFICIAL-only,
  //   so pilot queries never hit the official subgraph and vice-versa.
  // - V2 always uses VITE_API_URL/indexer.
  const V3_OVERRIDE_URL: Record<number, string | undefined> = {
    [ChainId.BERA_MAINNET]: import.meta.env.VITE_INDEXER_V3_URL,
  }
  // Goldsky override only for the OFFICIAL deployment (version 4).
  const override = version === 4 ? V3_OVERRIDE_URL[chainId] : undefined
  const useOverride = !!override && useV3Indexer(chainId, version)
  const url = useOverride
    ? override
    : `${import.meta.env.VITE_API_URL}${isV3Like(version) ? '/indexer/v3' : '/indexer'}?chainId=${chainId}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    // Indexer is a public read-only GraphQL endpoint — no cookies, no auth.
    // `credentials: 'include'` would trigger the credentials-CORS rule against
    // the API's `Access-Control-Allow-Origin: *` (forbidden combo), causing
    // intermittent failures depending on whether any cookies were set for
    // api.brownfi.io. Omitting credentials makes behavior deterministic.
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName, query, variables: restVar }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const res = await response.json()
    return res.data ?? null
  } finally {
    clearTimeout(timeoutId)
  }
}
