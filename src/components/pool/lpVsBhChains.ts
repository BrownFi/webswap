import { ChainId } from '@brownfi/sdk'

// Chains where the "LP vs. BH" line is surfaced on the pool charts (boss request,
// 2026-07-14) — the LP chart (PairChartTV) and the Pool Balance chart (via Detail).
// It's driven by bnhPrice (available on all V3 chains), so this is a pure display
// gate: add/remove chains here to control where LP-vs-BH appears. Kept in its own
// tiny module so Detail can read it without eager-importing the lazy-loaded LP chart.
export const CHAINS_WITH_LP_VS_BH = new Set<number>([
  ChainId.BERA_MAINNET,
  ChainId.LINEA_MAINNET,
  ChainId.HYPER_EVM,
  ChainId.ARBITRUM_MAINNET,
])

export const showsLpVsBh = (chainId?: number | null): boolean => chainId != null && CHAINS_WITH_LP_VS_BH.has(chainId)
