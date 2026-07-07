import { isV3Like } from '@brownfi/sdk'
import { Pair } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSingleCallResult } from 'state/multicall/hooks'
import { usePairV2Contract } from './useContract'
import { useStorageCache } from './useStorageCache'

type Props = {
  pair: Pair
  // When false, skip the on-chain fee read entirely. The pool list already has
  // the fee from the indexer (pairStats.fee) for every fresh pool, so firing
  // readV3PairConfig per pool was pure waste — one RPC round-trip per card. The
  // caller passes `!shouldUseIndexer` (mirrors how useTotalSupply is gated).
  enabled?: boolean
}

export const useTradingFee = ({ pair, enabled = true }: Props) => {
  const { chainId } = useActiveWeb3React()
  // Read version from the PAIR, not the global useVersion store. The global
  // store reflects the user's "default version" preference (V2/V3 toggle on
  // Add/Remove Liquidity), which has nothing to do with the source of the
  // current swap. Smart routing means a swap can hit a V3 pair even when
  // the user's stored default is V2 — using global state here meant we'd
  // query the V2 fee selector on a V3 pool address and silently get 0.
  // Mirror the fix already applied in useApproveCallback / contract/swap.
  const version = pair.version ?? 2

  const { get: getTradingFee, save: saveTradingFee, isAvailable } = useStorageCache({
    key: ['tradingFee', 'v2shape', pair.liquidityToken.address, `v${version}`].join('-'),
    initValue: 0,
    cacheTime: 1 * 60 * 60,
  })

  const pairContract = usePairV2Contract(pair.liquidityToken.address)
  const isV2 = version === 2
  const isV3 = isV3Like(version)
  const feeContract = version >= 1 && version <= 2 ? pairContract : null
  const precisionContract = isV2 ? pairContract : null
  const feeResult = useSingleCallResult(feeContract, 'fee', undefined, { disabled: !enabled || isAvailable() || isV3 })
  const precisionResult = useSingleCallResult(precisionContract, 'PRECISION', undefined, {
    disabled: !enabled || isAvailable() || isV3,
  })
  const fee = (feeResult.result?.[0] || 0) * (isV2 ? 1 : 2)
  const precision = isV2 ? precisionResult.result?.[0] || 100000000 : 10000
  const v2TradingFee = (Number(fee) * 100) / precision

  // V3: read from pairConfig via viem (matches useDevStats logic)
  const { data: v3TradingFee } = useQuery({
    queryKey: ['tradingFeeV3', chainId, pair.liquidityToken.address, `v${version}`],
    queryFn: async () => {
      // Pool's version (pair.version) → v4 pools read their own factory, not pilot.
      const { readV3PairConfig, fromPrec } = await import('utils/v3Config')
      const config = await readV3PairConfig(chainId, version, pair.liquidityToken.address)
      if (!config) return 0
      return fromPrec(config.fee) * 100
    },
    enabled: enabled && isV3 && !isAvailable(),
    staleTime: 2 * 60 * 1000,
  })

  const tradingFee = isV3 ? v3TradingFee ?? 0 : v2TradingFee

  useEffect(() => {
    if (tradingFee) {
      saveTradingFee(tradingFee)
    }
  }, [tradingFee])

  return getTradingFee()
}
