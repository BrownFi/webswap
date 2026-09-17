const GIGADEX_POOLS_URL = 'https://edge.gigadex.fi/v1/global/pools?chainId=4663'

interface GigaDexPoolRaw {
  id?: string
  kind?: string
  gaugeCreatedAt?: number | null
  farmApr?: number | null
}

interface GigaDexResponse {
  data?: {
    pools?: GigaDexPoolRaw[]
  }
}

export interface GigaPoolApr {
  apr: number
}

// The endpoint returns APR in percentage points (e.g. 59.3 means 59.3%).
// Keep only BrownFi PROPAMM pools that have a gauge. A gauge can have 0 APR
// while its farming period is inactive, so do not gate on current emissions.
export async function fetchGigaPoolApr(): Promise<Record<string, GigaPoolApr>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(GIGADEX_POOLS_URL, { signal: controller.signal })
    if (!response.ok) return {}
    const json = (await response.json()) as GigaDexResponse
    const result: Record<string, GigaPoolApr> = {}
    for (const pool of json.data?.pools ?? []) {
      if (pool.kind !== 'PROPAMM' || !pool.id || pool.gaugeCreatedAt == null) continue
      result[pool.id.toLowerCase()] = { apr: Number(pool.farmApr) || 0 }
    }
    return result
  } catch {
    return {}
  } finally {
    clearTimeout(timeoutId)
  }
}
