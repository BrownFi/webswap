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
    const response = await fetch(url.toString(), { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

type UserRank = {
  rank?: number
  address: string
  volume: string
  lastTimestamp: string
  firstTimestamp: string
  createdAt: string
  updatedAt: string
}

const fetchLeaderboard = (params?: any) =>
  fetchJson<{ items: UserRank[]; total: number }>(`/leaderboard-042025`, { params })

const getUserRank = (address: string) =>
  fetchJson<UserRank>(`/leaderboard-042025/user/${address}`)

export const apiV1Service = {
  fetchLeaderboard,
  getUserRank,
}
