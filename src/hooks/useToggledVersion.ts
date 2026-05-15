/**
 * Legacy Version enum kept for the swap-args / approval / v1 helper modules
 * that still pattern-match on tradeVersion. The runtime URL `?use=v1` flag
 * was retired with the Swap-page unified-router refactor — Swap always uses
 * V2 (and future V3 will land as a separate adapter source).
 *
 * Add/Remove Liquidity still surface a V2/V3 switcher via `useVersion`
 * (separate hook), since the liquidity protocols differ per version.
 */
export enum Version {
  v1 = 'v1',
  v2 = 'v2',
}

export const DEFAULT_VERSION: Version = Version.v2
