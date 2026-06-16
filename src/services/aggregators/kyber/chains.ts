import { ChainId } from '@brownfi/sdk'
import type { BrownFiVersion } from '../types'

/**
 * Kyber's Aggregator API uses a chain-slug-based URL path
 * (e.g. /berachain/api/v1/routes) and its router contract is deployed per
 * chain. Kyber routes through every DEX it knows about on that chain —
 * it does NOT need a per-BrownFi-version gate. The `version` param of
 * `isKyberSupported` is accepted to satisfy the AggregatorAdapter
 * interface but is intentionally ignored: chain support is the only
 * gate. (Earlier versions of this file had a KYBER_V2 / KYBER_V3 split
 * that conflated BrownFi pool versions with Kyber product versions and
 * caused Kyber quotes to silently disappear when the global useVersion
 * state was 3.)
 */
export const KYBER_AGGREGATOR_CHAIN_SLUG: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.BSC_MAINNET]: 'bsc',
  [ChainId.BASE_MAINNET]: 'base',
  [ChainId.ARBITRUM_MAINNET]: 'arbitrum',
  [ChainId.LINEA_MAINNET]: 'linea',
  [ChainId.BERA_MAINNET]: 'berachain',
  // Kyber added HyperEVM at our request — verified live 2026-06-12: /routes +
  // /route/build both 200, router 0x6131B5fae19EA4f9D964eAc0408E4408b66337b5.
  [ChainId.HYPER_EVM]: 'hyperevm',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isKyberSupported(chainId: ChainId, _version: BrownFiVersion): boolean {
  return !!KYBER_AGGREGATOR_CHAIN_SLUG[chainId]
}

/**
 * Kyber's Zap API is a separate product from Aggregator. Its chain coverage
 * differs (zap is currently live on fewer chains) and the URL path is
 * `/<slug>/api/v1/in|out/route`. Keep these maps separate so a chain showing
 * up in one product doesn't accidentally enable the other.
 */
export const KYBER_ZAP_CHAIN_SLUG: Partial<Record<ChainId, string>> = {
  [ChainId.BERA_MAINNET]: 'berachain',
  [ChainId.LINEA_MAINNET]: 'linea',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isKyberZapSupported(chainId: ChainId, _version: BrownFiVersion): boolean {
  return !!KYBER_ZAP_CHAIN_SLUG[chainId]
}
