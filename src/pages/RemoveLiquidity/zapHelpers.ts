import { kyberZapService } from 'services'

/**
 * Type alias for the raw Kyber zap-out response shape. Used by
 * RemoveLiquidity to cast best.quote.routeSummary back to the Kyber-specific
 * struct that ZapRoutePreview expects. The API + execution paths now live
 * behind the kyber zap adapter; this file keeps only the shared type.
 */
export type KyberZapOutRouteData = Awaited<ReturnType<typeof kyberZapService['getKyberZapOutRoute']>>
