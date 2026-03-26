import { Pair } from '@brownfi/sdk'
import { useActiveWeb3React } from 'hooks'
import { useEffect } from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'
import { usePairV2Contract } from './useContract'
import { useStorageCache } from './useStorageCache'
import { useVersion } from './useVersion'

type Props = {
  pair: Pair
}

export const useTradingFee = ({ pair }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const { get: getTradingFee, save: saveTradingFee, isAvailable } = useStorageCache({
    key: ['tradingFee', pair.liquidityToken.address, `v${version}`].join('-'),
    initValue: 0,
    cacheTime: 1 * 60 * 60,
  })

  const pairContract = usePairV2Contract(pair.liquidityToken.address)
  const isV2 = version === 2
  const feeContract = version >= 1 && version <= 2 ? pairContract : null
  const precisionContract = isV2 ? pairContract : null
  const feeResult = useSingleCallResult(feeContract, 'fee', undefined, { disabled: isAvailable() })
  const precisionResult = useSingleCallResult(precisionContract, 'PRECISION', undefined, { disabled: isAvailable() })
  const fee = (feeResult.result?.[0] || 0) * (isV2 ? 1 : 2)
  const precision = isV2 ? precisionResult.result?.[0] || 100000000 : 10000
  const tradingFee = (Number(fee) * 100) / precision

  useEffect(() => {
    if (tradingFee) {
      saveTradingFee(tradingFee)
    }
  }, [tradingFee])

  return getTradingFee()
}
