import { ChainId } from '@brownfi/sdk'

// Which chains surface each ROI % line on the pool charts (boss request). Driven by
// uniV2Price/bnhPrice (available on all V3 chains), so these are pure display gates —
// add/remove chains here. Used by the LP chart (PairChartTV) and, for HODL, the Pool
// Balance chart (via Detail). Kept in its own tiny module so Detail can read it without
// eager-importing the lazy-loaded LP chart.

// "LP vs. UniV2" — Bera + Linea/Hyper/Arb.
export const CHAINS_WITH_LP_VS_UNIV2 = new Set<number>([
  ChainId.BERA_MAINNET,
  ChainId.LINEA_MAINNET,
  ChainId.HYPER_EVM,
  ChainId.ARBITRUM_MAINNET,
])

// "LP vs. HODL" — Linea/Hyper/Arb only (NOT Bera, per boss 2026-07-14).
export const CHAINS_WITH_LP_VS_HODL = new Set<number>([
  ChainId.LINEA_MAINNET,
  ChainId.HYPER_EVM,
  ChainId.ARBITRUM_MAINNET,
])

export const showsLpVsUniV2 = (chainId?: number | null): boolean =>
  chainId != null && CHAINS_WITH_LP_VS_UNIV2.has(chainId)

export const showsLpVsHodl = (chainId?: number | null): boolean =>
  chainId != null && CHAINS_WITH_LP_VS_HODL.has(chainId)
