import { ChainId, Currency, Field, getPythPrice } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { wrappedCurrency } from 'utils/wrappedCurrency'

type Props = {
  currencyA?: Currency | null
  currencyB?: Currency | null
  chainId?: ChainId
}

export const usePythPrices = ({ currencyA, currencyB, chainId }: Props) => {
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const { data: tokenAPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenA?.address, tokenA?.chainId),
    queryKey: ['getPythPrice', tokenA?.address],
    enabled: !!tokenA
  })

  const { data: tokenBPrice = 0 } = useQuery({
    queryFn: () => getPythPrice(tokenB?.address, tokenB?.chainId),
    queryKey: ['getPythPrice', tokenB?.address],
    enabled: !!tokenB
  })

  const pythPrices = {
    [Field.CURRENCY_A]: tokenAPrice,
    [Field.CURRENCY_B]: tokenBPrice
  }
  return pythPrices
}
