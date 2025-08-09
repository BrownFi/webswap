import { ChainId, Currency, Field, getPriceFromUnsafe, getPythPricePair, Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useFactoryContract, usePythContract } from './useContract'
import { useVersion } from './useVersion'
import { useStorageCache } from './useStorageCache'

type Props = {
  pair?: Pair
  currencyA?: Currency | null
  currencyB?: Currency | null
  chainId?: ChainId
}

export const usePythPrices = ({ pair, currencyA, currencyB, chainId }: Props) => {
  const { version } = useVersion({ chainId })

  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const { get: getTokenA, save: saveTokenA, isAvailable: isAvailableTokenA } = useStorageCache({
    key: ['pythPrice', tokenA?.address].join('-'),
    initValue: 0,
    cacheTime: 1 * 60
  })
  const { get: getTokenB, save: saveTokenB, isAvailable: isAvailableTokenB } = useStorageCache({
    key: ['pythPrice', tokenB?.address].join('-'),
    initValue: 0,
    cacheTime: 1 * 60
  })

  const factoryContract = useFactoryContract()
  const pythContract = usePythContract()

  if (!tokenA || !tokenB || !chainId) {
    return {
      [Field.CURRENCY_A]: 0,
      [Field.CURRENCY_B]: 0
    }
  }

  const priceFeedIds = useSingleContractMultipleData(
    factoryContract,
    'priceFeedIds',
    tokenA && tokenB && version === 2 ? [[tokenA?.address], [tokenB?.address]] : []
  )

  const priceUnsafes = useSingleContractMultipleData(
    pythContract,
    'getPriceUnsafe',
    priceFeedIds.every(a => a.result) ? priceFeedIds.map(a => a.result?.flat()) : []
  )

  const [tokenAPrice, tokenBPrice] = useMemo(() => {
    if (priceUnsafes.length !== 2) return [0, 0]
    if (priceUnsafes.some(priceUnsafe => !priceUnsafe.result)) return [0, 0]
    return priceUnsafes.map(priceUnsafe => getPriceFromUnsafe(priceUnsafe.result?.[0]))
  }, [priceUnsafes])

  useEffect(() => {
    if (tokenAPrice) {
      saveTokenA(tokenAPrice)
    }
    if (tokenBPrice) {
      saveTokenB(tokenBPrice)
    }
  }, [tokenAPrice, tokenBPrice])

  const { data: tokenPrices = [0, 0] } = useQuery({
    queryFn: () => getPythPricePair(pair, chainId),
    queryKey: ['getPythPricePair', pair?.liquidityToken.address],
    enabled: !!pair && version === 1
  })

  const pythPrices = {
    [Field.CURRENCY_A]: (version === 2 ? tokenAPrice : tokenPrices[0]) || 0,
    [Field.CURRENCY_B]: (version === 2 ? tokenBPrice : tokenPrices[1]) || 0
  }
  return pythPrices
}
