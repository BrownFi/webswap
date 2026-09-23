export type CompetitorReference = {
  poolIdentifier?: string
  version: 'V3' | 'V4'
  feeTier: number
  isDynamicFee?: boolean
  tvlUSD: number
  vol24hUSD: number
  fees24hUSD: number
}

export interface CompetitorPairData {
  feeTier: number
  tvlUSD: number
  vol24hUSD: number
  fees24hUSD: number
  references?: CompetitorReference[]
}

export function competitorPairKey(a: string, b: string): string {
  return [a.toLowerCase(), b.toLowerCase()].sort().join('-')
}
