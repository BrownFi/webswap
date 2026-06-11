import { ChainId } from '@brownfi/sdk'
import { V3_USE_INDEXER } from 'lib/sdk/constants/addresses'

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
  // V3 routing per chain.
  //
  // - Bera: temporary Goldsky subgraph at VITE_INDEXER_V3_URL (the BE
  //   hasn't folded the Bera v3-final factory into the main /indexer/v3
  //   path yet). The map below applies the override ONLY to Bera so the
  //   URL doesn't accidentally serve other chains.
  // - HyperEVM (and any future chain): standard
  //   VITE_API_URL/indexer/v3?chainId={chainId} — the BE-hosted multi-
  //   chain V3 indexer. When the chain's subgraph isn't live yet, the
  //   response is a clean 404 caught by React Query (Pool list/detail
  //   fall back to the on-chain hook via V3_USE_INDEXER[chainId]=false).
  // - V2 always uses VITE_API_URL/indexer.
  //
  // When BE migrates Bera to /indexer/v3 too, unset VITE_INDEXER_V3_URL
  // (or drop the Bera entry below) and Bera will fall through to the
  // standard path like every other chain.
  const V3_OVERRIDE_URL: Record<number, string | undefined> = {
    [ChainId.BERA_MAINNET]: import.meta.env.VITE_INDEXER_V3_URL,
  }
  const override = V3_OVERRIDE_URL[chainId]
  const useOverride =
    version === 3 && !!override && (V3_USE_INDEXER[chainId] ?? false)
  const url = useOverride
    ? override
    : `${import.meta.env.VITE_API_URL}${version === 3 ? '/indexer/v3' : '/indexer'}?chainId=${chainId}`
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
