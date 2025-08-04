import { Pair } from '@brownfi/sdk'
import { useVersion } from './useVersion'
import { useActiveWeb3React } from 'hooks'
import { useQuery } from '@tanstack/react-query'
import { useStorageCache } from './useStorageCache'

type Props = {
  pair: Pair
}

export const useTradingFee = ({ pair }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const { get, save, isExpired } = useStorageCache({
    key: ['tradingFee', pair.liquidityToken.address, version].join('-'),
    initValue: 0,
    cacheTime: 1 * 60 * 60
  })

  const { data: tradingFee = 0 } = useQuery({
    queryFn: async () => {
      let tradingFee = 0
      if (isExpired()) {
        tradingFee = (await pair.getTradingFee()) * (version === 1 ? 2 : 1)
        save(tradingFee)
        return tradingFee
      } else {
        return get()
      }
    },
    queryKey: ['tradingFee', pair.liquidityToken.address, version]
  })

  return tradingFee
}
