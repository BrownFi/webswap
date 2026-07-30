// Competitor (rival DEX) comparison data, keyed per chain. The pool list and
// pool detail show a side-by-side of our pool vs the dominant competitor on the
// same chain — Kodiak (Bera), Project X (HyperEVM), Uniswap (Arbitrum),
// Etherex (Linea). See getCompetitor.
import { ChainId } from '@brownfi/sdk'
import { fetchKodiakPairMap } from './kodiakService'
import { fetchProjectXPairMap } from './projectXService'
import { fetchUniswapPairMap } from './uniswapService'
import { fetchEtherexPairMap } from './etherexService'

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

// Berachain token addresses used by the reference-pair overrides below.
const BERA_DOLO = '0x0F81001eF0A83ecCE5ccebf63EB302c70a39a654'
const BERA_HONEY = '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce'
const BERA_WBERA = '0x6969696969696969696969696969696969696969'

// Reference-pair overrides. For a few of our pools the natural same-pair match
// on the competitor DEX is a near-dead pool (negligible TVL/volume), so the
// side-by-side comparison is meaningless. Point those at a more-liquid related
// pair on the same competitor instead. Keyed per chain by OUR pool's pair key →
// the competitor pair key to look up in its place.
const REFERENCE_PAIR_OVERRIDES: Partial<Record<number, Record<string, string>>> = {
  [ChainId.BERA_MAINNET]: {
    // Kodiak's DOLO/HONEY pool is dead (~$59 TVL, $0 24h vol). Reference the
    // active DOLO/WBERA pool instead (~$128k TVL, ~$9.5k 24h vol).
    [competitorPairKey(BERA_DOLO, BERA_HONEY)]: competitorPairKey(BERA_DOLO, BERA_WBERA),
  },
}

// Competitor-map lookup key for one of OUR pools: the pair key, unless a
// per-chain override redirects it to a different competitor pair.
export function competitorLookupKey(chainId: number, a: string, b: string): string {
  const key = competitorPairKey(a, b)
  return REFERENCE_PAIR_OVERRIDES[chainId]?.[key] ?? key
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
    case ChainId.ARBITRUM_MAINNET:
      return { name: 'Uniswap', queryKey: 'uniswapPairMap', fetch: fetchUniswapPairMap }
    case ChainId.LINEA_MAINNET:
      return { name: 'Etherex', queryKey: 'etherexPairMap', fetch: fetchEtherexPairMap }
    default:
      return undefined
  }
}
