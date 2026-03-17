import { Pair } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { useActiveWeb3React } from 'hooks'
import { useCallback, useEffect } from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'
import { usePairV2Contract } from './useContract'
import { useStorageCache } from './useStorageCache'
import { useVersion } from './useVersion'

const Q64_DENOMINATOR = BigNumber.from(2).pow(64)
const PROTOCOL_FEE_DENOMINATOR = BigNumber.from(10).pow(8)
const NORMALIZE_SCALE = BigNumber.from(10).pow(6)

const normalizeByDenominator = (value: BigNumber | undefined, denominator: BigNumber) => {
  if (!value) return undefined
  const scaled = value.mul(NORMALIZE_SCALE).div(denominator)
  return scaled.toNumber() / NORMALIZE_SCALE.toNumber()
}

type Props = {
  pair: Pair
  enabled?: boolean
}

export const useDevStats = ({ pair, enabled = true }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const { get: getDevStats, save: saveDevStats, isAvailable } = useStorageCache({
    key: ['devStats', pair.liquidityToken.address].join('-'),
    initValue: { lambda: 0, kappa: 0, protocolFee: 0 },
    cacheTime: 2 * 60,
  })

  const pairContract = usePairV2Contract(pair.liquidityToken.address)
  const contract = enabled && version === 2 ? pairContract : null
  const hasCache = isAvailable()
  const shouldSkipCall = hasCache || !contract

  const lambdaCall = useSingleCallResult(contract, 'lambda', undefined, { disabled: shouldSkipCall })
  const kappaCall = useSingleCallResult(contract, 'k', undefined, { disabled: shouldSkipCall })
  const protocolFeeCall = useSingleCallResult(contract, 'protocolFee', undefined, { disabled: shouldSkipCall })

  // Stabilize saveDevStats reference to prevent effect re-runs
  const stableSave = useCallback(
    (data: { lambda: number; kappa: number; protocolFee: number }) => saveDevStats(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pair.liquidityToken.address],
  )

  useEffect(() => {
    if (shouldSkipCall) return

    const lambda = normalizeByDenominator(lambdaCall.result?.[0], Q64_DENOMINATOR)
    const kappa = normalizeByDenominator(kappaCall.result?.[0], Q64_DENOMINATOR)
    const protocolFee = normalizeByDenominator(protocolFeeCall.result?.[0], PROTOCOL_FEE_DENOMINATOR)

    if (lambda === undefined || kappa === undefined || protocolFee === undefined) return

    stableSave({ lambda, kappa, protocolFee })
  }, [shouldSkipCall, lambdaCall.result, kappaCall.result, protocolFeeCall.result, stableSave])

  return getDevStats()
}
