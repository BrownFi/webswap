import { ChainId, Currency, Field, getPythPrice, getPythPricePair, isRouterV2, Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { wrappedCurrency } from 'utils/wrappedCurrency'

type Props = {
  pair?: Pair
  currencyA?: Currency | null
  currencyB?: Currency | null
  chainId?: ChainId
}

export const usePythPrices = ({ pair, currencyA, currencyB, chainId }: Props) => {
  const isV2 = isRouterV2(chainId!)
  const isV1 = !isV2

  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const { data: tokenAPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenA?.address, chainId),
    queryKey: ['getPythPrice', tokenA?.address],
    enabled: !!tokenA && isV2
  })

  const { data: tokenBPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenB?.address, chainId),
    queryKey: ['getPythPrice', tokenB?.address],
    enabled: !!tokenB && isV2
  })

  const { data: tokenPrices = [0, 0] } = useQuery({
    queryFn: () => getPythPricePair(pair, chainId),
    queryKey: ['getPythPricePair', pair?.liquidityToken.address],
    enabled: !!pair && isV1
  })

  const pythPrices = {
    [Field.CURRENCY_A]: isV2 ? tokenAPrice : tokenPrices[0],
    [Field.CURRENCY_B]: isV2 ? tokenBPrice : tokenPrices[1]
  }
  return pythPrices
}
