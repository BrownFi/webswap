import { ChainId } from '@brownfi/sdk'

export const graphqlFetcher = async ({
  operationName,
  query,
  variables,
}: {
  operationName: string
  query: string
  variables: object
}) => {
  const { chainId, ...restVar } = variables as { chainId: number }
  if (chainId !== ChainId.BERA_MAINNET) {
    query = query.replace(/stakeLP/g, '')
  }
  const url = `${import.meta.env.VITE_API_URL}/indexer?chainId=${chainId}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName, query, variables: restVar }),
      credentials: 'include',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const res = await response.json()
    return res.data
  } finally {
    clearTimeout(timeoutId)
  }
}
