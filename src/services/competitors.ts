// Competitor (rival DEX) comparison data, keyed per chain. The pool list and
// pool detail show a side-by-side of our pool vs the dominant competitor on the
// same chain — Kodiak on Berachain, Project X on HyperEVM.
import { ChainId } from '@brownfi/sdk'
import { fetchKodiakPairMap } from './kodiakService'
import { fetchProjectXPairMap } from './projectXService'

export interface CompetitorPairData {
  // feeTier in hundredths of a bip (500 = 0.05%, 3000 = 0.3%).
  feeTier: number
  tvlUSD: number
  vol24hUSD: number
  fees24hUSD: number
}

// Map key for a token pair: both addresses lowercased and sorted so token order
// never matters when matching across DEXes.
export function competitorPairKey(a: string, b: string): string {
  return [a.toLowerCase(), b.toLowerCase()].sort().join('-')
}

export interface CompetitorConfig {
  // Display name shown in the column headers / comparison card.
  name: string
  // React Query cache key — shared between the list and detail pages.
  queryKey: string
  // Fetches the competitor's pools and returns a pair-keyed map.
  fetch: () => Promise<Record<string, CompetitorPairData>>
}

// Returns the competitor config for a chain, or undefined where we have none.
export function getCompetitor(chainId: number): CompetitorConfig | undefined {
  switch (chainId) {
    case ChainId.BERA_MAINNET:
      return { name: 'Kodiak', queryKey: 'kodiakPairMap', fetch: fetchKodiakPairMap }
    case ChainId.HYPER_EVM:
      return { name: 'Project X', queryKey: 'projectXPairMap', fetch: fetchProjectXPairMap }
    default:
      return undefined
  }
}
