import { ChainId, Currency, Field, getPythPrice, getPythPricePair, Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useVersion } from './useVersion'

type Props = {
  pair?: Pair
  currencyA?: Currency | null
  currencyB?: Currency | null
  chainId?: ChainId
  enabled?: boolean
}

export const usePythPrices = ({ pair, currencyA, currencyB, chainId, enabled = true }: Props) => {
  const { version } = useVersion({ chainId })

  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  if (!tokenA || !tokenB || !chainId)
    return {
      [Field.CURRENCY_A]: 0,
      [Field.CURRENCY_B]: 0
    }

  const { data: tokenAPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenA.address, chainId, version),
    queryKey: ['getPythPrice', tokenA?.address],
    enabled: enabled && !!tokenA && version === 2
  })

  const { data: tokenBPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenB.address, chainId, version),
    queryKey: ['getPythPrice', tokenB?.address],
    enabled: enabled && !!tokenB && version === 2
  })

  const { data: tokenPrices = [0, 0] } = useQuery({
    queryFn: () => getPythPricePair(pair, chainId),
    queryKey: ['getPythPricePair', pair?.liquidityToken.address],
    enabled: enabled && !!pair && version === 1
  })

  const pythPrices = {
    [Field.CURRENCY_A]: version === 2 ? tokenAPrice : tokenPrices[0],
    [Field.CURRENCY_B]: version === 2 ? tokenBPrice : tokenPrices[1]
  }
  return pythPrices
}
