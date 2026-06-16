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
  // V3-gen routing per (chain, version). Each V3 generation has its OWN Goldsky
  // subgraph on Bera so Pilot and Official stay separate (the BE merged v3-final
  // into /indexer/v3, so that endpoint now serves Official for BOTH versions —
  // hence the per-version overrides below):
  // - V3 Official (version 4): VITE_INDEXER_V3_URL → bf-v3-berachain/0.0.2
  //   (indexes the v3-final factory 0x6Ccf36d3). HyperEVM falls through to
  //   VITE_API_URL/indexer/v3 (BE multi-chain indexer tracks the official HL
  //   factory).
  // - V3 Pilot (version 3): VITE_INDEXER_V3_PILOT_URL → bf-v3-berachain/0.0.1
  //   (indexes the pilot factory 0x83A329E9). BETA/DEV ONLY — Pilot is hidden on
  //   mainnet, so this var is absent on prod and the override never fires there.
  //   Without it, Pilot would route to /indexer/v3 and show the merged Official
  //   data (the bug this fixes).
  // - V2 always uses VITE_API_URL/indexer.
  const V3_OFFICIAL_OVERRIDE: Record<number, string | undefined> = {
    [ChainId.BERA_MAINNET]: import.meta.env.VITE_INDEXER_V3_URL,
  }
  const V3_PILOT_OVERRIDE: Record<number, string | undefined> = {
    [ChainId.BERA_MAINNET]: import.meta.env.VITE_INDEXER_V3_PILOT_URL,
  }
  const override =
    version === 4 ? V3_OFFICIAL_OVERRIDE[chainId] : version === 3 ? V3_PILOT_OVERRIDE[chainId] : undefined
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
