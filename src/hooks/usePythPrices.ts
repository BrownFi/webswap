import { ChainId, Currency, Field, getPriceFromUnsafe, getPythPricePair, Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useFactoryContract, usePythContract } from './useContract'
import { useVersion } from './useVersion'
import { PairStats } from 'components/PositionCard/usePoolStats'

type Props = {
  chainId: ChainId
  pair?: Pair
  pairStats?: PairStats
  currencyA?: Currency | null
  currencyB?: Currency | null
}

export const usePythPrices = ({ chainId, pair, pairStats, currencyA, currencyB }: Props) => {
  const { version } = useVersion({ chainId })

  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const factoryContract = useFactoryContract()
  const pythContract = usePythContract()

  if (!tokenA || !tokenB || !chainId) {
    return {
      [Field.CURRENCY_A]: 0,
      [Field.CURRENCY_B]: 0,
    }
  }

  const priceFeedIds = useSingleContractMultipleData(
    factoryContract,
    'priceFeedIds',
    tokenA && tokenB && version === 2 ? [[tokenA?.address], [tokenB?.address]] : [],
    { disabled: !!pairStats },
  )

  const priceUnsafes = useSingleContractMultipleData(
    pythContract,
    'getPriceUnsafe',
    pairStats
      ? [[pairStats.token0!.priceFeedId], [pairStats.token1!.priceFeedId]]
      : priceFeedIds.every((a) => a.result)
      ? priceFeedIds.map((a) => a.result?.flat())
      : [],
  )

  const [tokenAPrice, tokenBPrice] = useMemo(() => {
    const fallbackPrices = [pairStats?.token0?.price ?? 0, pairStats?.token1?.price ?? 0]
    if (priceUnsafes.length !== 2) return fallbackPrices
    if (priceUnsafes.some((priceUnsafe) => !priceUnsafe.result)) return fallbackPrices
    return priceUnsafes.map((priceUnsafe) => getPriceFromUnsafe(priceUnsafe.result?.[0]))
  }, [priceUnsafes, pairStats])

  const { data: tokenPrices = [0, 0] } = useQuery({
    queryFn: () => getPythPricePair(pair, chainId),
    queryKey: ['getPythPricePair', pair?.liquidityToken.address],
    enabled: !!pair && version === 1,
  })

  const pythPrices = {
    [Field.CURRENCY_A]: (version === 2 ? tokenAPrice : tokenPrices[0]) || 0,
    [Field.CURRENCY_B]: (version === 2 ? tokenBPrice : tokenPrices[1]) || 0,
  }
  return pythPrices
}
