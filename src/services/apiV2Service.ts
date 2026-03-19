const BASE_URL = import.meta.env.VITE_API_URL

async function fetchJson<T>(path: string, options?: { params?: Record<string, any>; timeout?: number }): Promise<T> {
  const url = new URL(path, BASE_URL)
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 10_000)
  try {
    const response = await fetch(url.toString(), { signal: controller.signal, credentials: 'include' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

type PoolPrices = {
  chainId: number
  price0: string
  price1: string
  timestamp: number
  tokenA: string
  tokenB: string
}

const getPoolPrices = (options?: { chainId: number; tokenA: string; tokenB: string }) =>
  fetchJson<PoolPrices>(`/prices`, { params: options })

const getPoolBgt = (options: { address: string }) =>
  fetchJson<{ apr: number }>(`/igbt-vault-apr`, { params: { pool: options.address } })

const getMerklCampaignApr = (options: { address: string }) =>
  fetchJson<{ apr: number }>(`/merkl-campaign`, { params: { pool: options.address } })

export const apiV2Service = {
  getPoolPrices,
  getPoolBgt,
  getMerklCampaignApr,
}
