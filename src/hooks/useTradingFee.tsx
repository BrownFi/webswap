import { useEffect } from 'react'

import { Pair } from '@brownfi/sdk'

import { useActiveWeb3React } from 'hooks'
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

  const {
    get: getTradingFee,
    save: saveTradingFee,
    isAvailable,
  } = useStorageCache({
    key: ['tradingFee', pair.liquidityToken.address].join('-'),
    initValue: 0,
    cacheTime: 1 * 60 * 60,
  })

  const pairContract = usePairV2Contract(pair.liquidityToken.address)
  const fee =
    (useSingleCallResult(pairContract, 'fee', undefined, { disabled: isAvailable() }).result?.[0] || 0) *
    (version === 2 ? 1 : 2)
  const precision =
    version === 2
      ? useSingleCallResult(pairContract, 'PRECISION', undefined, { disabled: isAvailable() }).result?.[0] || 100000000
      : 10000
  const tradingFee = (Number(fee) * 100) / precision

  useEffect(() => {
    if (tradingFee) {
      saveTradingFee(tradingFee)
    }
  }, [tradingFee])

  return getTradingFee()
}
