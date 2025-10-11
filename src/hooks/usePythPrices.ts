import { ChainId, Currency, Field, getPythPricePair, Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { PairStats } from 'components/PositionCard/usePoolStats'
import { apiV2Service } from 'services'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useVersion } from './useVersion'

type Props = {
  chainId: ChainId
  pair?: Pair
  pairStats?: PairStats
  currencyA?: Currency | null
  currencyB?: Currency | null
  enableFetchDetail?: boolean
}

export const usePythPrices = ({ chainId, pair, pairStats, currencyA, currencyB, enableFetchDetail = true }: Props) => {
  const { version } = useVersion({ chainId })

  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  if (!tokenA || !tokenB || !chainId) {
    return {
      [Field.CURRENCY_A]: 0,
      [Field.CURRENCY_B]: 0,
    }
  }

  const { data: poolPrices } = useQuery({
    queryKey: ['getPoolPrices', chainId, tokenA.address, tokenB.address],
    queryFn: () =>
      apiV2Service.getPoolPrices({ chainId, tokenA: tokenA.address, tokenB: tokenB.address }).then((pool) => {
        return [+pool.price0 / 2 ** 64, +pool.price1 / 2 ** 64]
      }),
    enabled: version === 2 && enableFetchDetail,
  })

  const { data: tokenPrices = [0, 0] } = useQuery({
    queryFn: () => getPythPricePair(pair, chainId),
    queryKey: ['getPythPricePair', pair?.liquidityToken.address],
    enabled: !!pair && version === 1 && enableFetchDetail,
  })

  const fallbackPrices = [pairStats?.token0?.price ?? 0, pairStats?.token1?.price ?? 0]

  const pythPrices = {
    [Field.CURRENCY_A]: (version === 2 ? poolPrices?.[0] : tokenPrices[0]) || fallbackPrices[0],
    [Field.CURRENCY_B]: (version === 2 ? poolPrices?.[1] : tokenPrices[1]) || fallbackPrices[1],
  }
  return pythPrices
}
