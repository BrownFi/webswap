import { ChainId } from '@brownfi/sdk'
import { kyberZapService } from 'services'

export const SUPPORTED_ZAP_CHAIN_IDS = new Set<ChainId>([ChainId.BERA_MAINNET, ChainId.LINEA_MAINNET])

export const isZapSupportedOnChain = (chainId?: ChainId | null) =>
  chainId ? SUPPORTED_ZAP_CHAIN_IDS.has(chainId) : false

/**
 * Type alias for the raw Kyber zap-in response shape. Used by ZapRoutePreview
 * + ZapForm to extract the route summary out of the unified ZapInQuote that
 * the orchestration hook returns. The actual API calls now live behind the
 * kyber zap adapter; this file keeps only the chain-gate + shared type.
 */
export type KyberZapRouteData = Awaited<ReturnType<typeof kyberZapService['getKyberZapInRoute']>>
