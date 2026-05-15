import { ChainId } from '@brownfi/sdk'
import type { BrownFiVersion } from '../types'

/**
 * Kyber's Aggregator API uses a chain-slug-based URL path
 * (e.g. /berachain/api/v1/routes), and its router contract is deployed per
 * chain. We keep both the slug and a "BrownFi version × chain" support matrix
 * here so the adapter is just plumbing.
 *
 * V3 support intentionally false on every chain for now — Kyber's indexer is
 * still being onboarded onto BrownFi V3 pools. Flip on per chain once live.
 */
export const KYBER_AGGREGATOR_CHAIN_SLUG: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.BSC_MAINNET]: 'bsc',
  [ChainId.BASE_MAINNET]: 'base',
  [ChainId.ARBITRUM_MAINNET]: 'arbitrum',
  [ChainId.LINEA_MAINNET]: 'linea',
  [ChainId.BERA_MAINNET]: 'berachain',
}

const KYBER_V2_CHAINS: ReadonlySet<ChainId> = new Set([
  ChainId.MAINNET,
  ChainId.BSC_MAINNET,
  ChainId.BASE_MAINNET,
  ChainId.ARBITRUM_MAINNET,
  ChainId.LINEA_MAINNET,
  ChainId.BERA_MAINNET,
])

const KYBER_V3_CHAINS: ReadonlySet<ChainId> = new Set<ChainId>([
  // empty for now — flip on per chain when Kyber adds BrownFi V3 to its DEX list
])

export function isKyberSupported(chainId: ChainId, version: BrownFiVersion): boolean {
  if (!KYBER_AGGREGATOR_CHAIN_SLUG[chainId]) return false
  if (version === 2) return KYBER_V2_CHAINS.has(chainId)
  if (version === 3) return KYBER_V3_CHAINS.has(chainId)
  return false
}
