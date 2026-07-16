import { isV3Like } from '@brownfi/sdk'
import { Pair } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { PairStats } from 'components/PositionCard/usePoolStats'
import { useStorageCache } from './useStorageCache'
import { useVersion } from './useVersion'

type Props = {
  pair: Pair
  // Indexer-sourced stats for this pair. When present and populated, every
  // dev-param is read straight from here — no RPC fires. The pool list and
  // pool detail both already fetch this via GraphQL.
  pairStats?: PairStats
  enabled?: boolean
}

export const useDevStats = ({ pair, pairStats, enabled = true }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  // Indexer-first projection. Returns undefined when pairStats is absent so the
  // RPC fallback (readV3PairConfig) kicks in.
  const fromIndexer = useMemo(() => {
    if (!pairStats) return undefined
    if (pairStats.lambda === undefined && pairStats.kB === undefined) return undefined
    return {
      lambda: pairStats.lambda,
      kappa: pairStats.kB, // legacy alias
      kB: pairStats.kB,
      kQ: pairStats.kQ,
      fee: pairStats.fee,
      feeSplit: pairStats.feeSplit,
      protocolFee: 0,
      compress: pairStats.compress,
      sSell: pairStats.sSell,
      sBuy: pairStats.sBuy,
      fixS: pairStats.fixS,
      disThreshold: pairStats.disThreshold,
      sBound: pairStats.sBound,
      pythWeight: pairStats.pythWeight,
      gamma: pairStats.gamma,
    }
  }, [pairStats])

  const hasIndexerData = fromIndexer !== undefined

  const { get: getDevStats, save: saveDevStats } = useStorageCache({
    key: ['devStats', 'v3shape', pair.liquidityToken.address, `v${version}`].join('-'),
    initValue: {
      lambda: undefined as number | undefined,
      kappa: undefined as number | undefined,
      fee: undefined as number | undefined,
      protocolFee: undefined as number | undefined,
      feeSplit: undefined as number | undefined,
      kB: undefined as number | undefined,
      kQ: undefined as number | undefined,
      compress: undefined as number | undefined,
      sSell: undefined as number | undefined,
      sBuy: undefined as number | undefined,
      fixS: undefined as number | undefined,
      disThreshold: undefined as number | undefined,
      sBound: undefined as number | undefined,
      pythWeight: undefined as number | undefined,
      gamma: undefined as number | undefined,
    },
    cacheTime: 5 * 60,
  })

  // Read from the PairConfig contract via viem — fallback only, fires when the
  // indexer hasn't shipped this pair yet (just deployed, or backend down).
  useQuery({
    queryKey: ['v3DevStats', chainId, pair.liquidityToken.address, `v${version}`],
    queryFn: async () => {
      const { readV3PairConfig, fromQ64, fromPrec } = await import('utils/v3Config')
      const config = await readV3PairConfig(chainId, version, pair.liquidityToken.address)
      if (!config) return null

      const kB = fromQ64(config.kB)
      const kQ = fromQ64(config.kQ)
      const lambda = fromQ64(config.lambda)
      const kappa = kB // legacy alias; existing UI reads `kappa`
      const fee = fromPrec(config.fee)
      const feeSplit = fromPrec(config.feeSplit)
      const compress = fromPrec(config.compress)
      const sSell = fromPrec(config.sSell)
      const sBuy = fromPrec(config.sBuy)
      const fixS = fromPrec(config.fixS)
      const disThreshold = fromPrec(config.disThreshold)
      const sBound = fromPrec(config.sBound)
      const pythWeight = fromPrec(config.pythWeight)
      const gamma = fromPrec(config.gamma)

      const next = {
        lambda, kappa, fee, protocolFee: 0, feeSplit,
        kB, kQ, compress, sSell, sBuy, fixS, disThreshold, sBound, pythWeight, gamma,
      }
      saveDevStats(next)
      return next
    },
    enabled: enabled && isV3Like(version) && !hasIndexerData,
    staleTime: 5 * 60 * 1000,
  })

  return fromIndexer ?? getDevStats()
}
