import { ChainId, Currency, Field, getPythPrice, getPythPricePair, Pair, Token } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { PairStats } from 'components/PositionCard/usePoolStats'
import { useState } from 'react'
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
  const [apiFailed, setApiFailed] = useState(false)

  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const disabled = !tokenA || !tokenB || !chainId

  const { data: tokenPricesApi } = useQuery({
    queryKey: ['getPoolPrices', chainId, tokenA?.address, tokenB?.address],
    queryFn: () =>
      apiV2Service
        .getPoolPrices({ chainId, tokenA: tokenA!.address, tokenB: tokenB!.address })
        .then((pool) => {
          return [+pool.price0 / 2 ** 64, +pool.price1 / 2 ** 64]
        })
        .catch(() => {
          setApiFailed(true)
          return [0, 0]
        }),
    enabled: version === 2 && enableFetchDetail && !disabled,
    refetchInterval: 1 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  })

  const tokenPricesV2 = usePythPricesV2({
    chainId,
    tokenA: tokenA!,
    tokenB: tokenB!,
    enabled: version === 2 && enableFetchDetail && apiFailed && !disabled,
  })

  const { data: tokenPricesV1 = [0, 0] } = useQuery({
    queryFn: () => getPythPricePair(pair, chainId),
    queryKey: ['getPythPricePair', pair?.liquidityToken.address],
    enabled: !!pair && version === 1 && enableFetchDetail && !disabled,
  })

  if (!tokenA || !tokenB || !chainId) {
    return {
      [Field.CURRENCY_A]: 0,
      [Field.CURRENCY_B]: 0,
    }
  }

  const fallbackPrices = [pairStats?.token0?.price ?? 0, pairStats?.token1?.price ?? 0]

  const pythPrices = {
    [Field.CURRENCY_A]:
      (version === 2 ? tokenPricesApi?.[0] || tokenPricesV2[0] : tokenPricesV1[0]) || fallbackPrices[0],
    [Field.CURRENCY_B]:
      (version === 2 ? tokenPricesApi?.[1] || tokenPricesV2[1] : tokenPricesV1[1]) || fallbackPrices[1],
  }

  return pythPrices
}

type PropsV2 = {
  chainId: ChainId
  tokenA: Token
  tokenB: Token
  enabled?: boolean
}

const usePythPricesV2 = ({ chainId, tokenA, tokenB, enabled = false }: PropsV2) => {
  const { version } = useVersion({ chainId })

  const disabled = !enabled || !tokenA || !tokenB || version !== 2

  const { data: tokenAPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenA.address, chainId, version),
    queryKey: ['getPythPrice', tokenA?.address],
    enabled: !disabled,
  })

  const { data: tokenBPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenB.address, chainId, version),
    queryKey: ['getPythPrice', tokenB?.address],
    enabled: !disabled,
  })

  return [tokenAPrice, tokenBPrice]
}
