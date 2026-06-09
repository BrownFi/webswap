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
  // V3 routing: prefer VITE_INDEXER_V3_URL (a complete, host-included URL)
  // when set AND the chain is in V3_USE_INDEXER (i.e. its subgraph is the
  // one VITE_INDEXER_V3_URL points at). Otherwise — including V3 chains
  // still waiting on a subgraph (e.g. HyperEVM as of 2026-06-09) — fall
  // back to VITE_API_URL/indexer/v3?chainId=N so the request doesn't get
  // sent to another chain's subgraph and return the wrong pools.
  // V2 always uses VITE_API_URL/indexer.
  const v3OverrideEnv = import.meta.env.VITE_INDEXER_V3_URL
  const v3OverrideForThisChain =
    version === 3 && v3OverrideEnv && (V3_USE_INDEXER[chainId] ?? false)
      ? v3OverrideEnv
      : undefined
  const url = v3OverrideForThisChain
    ? v3OverrideForThisChain
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
