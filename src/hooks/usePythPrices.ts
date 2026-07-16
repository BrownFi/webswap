import { ChainId, Currency, Field, getPythPrice, Pair, Token } from '@brownfi/sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
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

export const usePythPrices = ({ chainId, pairStats, currencyA, currencyB, enableFetchDetail = true }: Props) => {
  const [apiFailed, setApiFailed] = useState(false)

  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const disabled = !tokenA || !tokenB || !chainId

  // Indexer prices come pre-baked in the bulk pair list / detail GraphQL.
  // When both sides are populated, no extra network call is needed.
  const indexerPrice0 = pairStats?.token0?.price ?? 0
  const indexerPrice1 = pairStats?.token1?.price ?? 0
  const hasBothIndexerPrices = indexerPrice0 > 0 && indexerPrice1 > 0

  // The /prices REST endpoint is only meaningful for pool-view surfaces (needs
  // pairStats). Gate REST on having pairStats so swap / add-liquidity (no-pair)
  // flows skip it and go straight to Pyth direct as primary.
  const restEnabled = !!pairStats && !hasBothIndexerPrices && enableFetchDetail && !disabled

  const { data: tokenPricesApi } = useQuery({
    queryKey: ['getPoolPrices', chainId, tokenA?.address, tokenB?.address],
    queryFn: () =>
      apiV2Service
        .getPoolPrices({ chainId, tokenA: tokenA!.address, tokenB: tokenB!.address })
        .then((pool) => {
          const p0 = +pool.price0 / 2 ** 64
          const p1 = +pool.price1 / 2 ** 64
          if (!p0 || !p1 || isNaN(p0) || isNaN(p1)) {
            setApiFailed(true)
            return [0, 0]
          }
          return [p0, p1]
        })
        .catch(() => {
          setApiFailed(true)
          return [0, 0]
        }),
    enabled: restEnabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  })

  // Pyth direct fires whenever REST isn't going to (no pairStats), or whenever
  // REST already failed. On the swap page this becomes the PRIMARY price source.
  const tokenPricesV2 = usePythPricesV2({
    chainId,
    tokenA: tokenA!,
    tokenB: tokenB!,
    enabled: enableFetchDetail && !disabled && (!restEnabled || apiFailed),
  })

  if (!tokenA || !tokenB || !chainId) {
    return {
      [Field.CURRENCY_A]: 0,
      [Field.CURRENCY_B]: 0,
    }
  }

  // Indexer-first per side; fall through to REST/Pyth when the indexer doesn't
  // know the token (swap / add-liquidity for never-before-seen tokens).
  const pythPrices = {
    [Field.CURRENCY_A]: indexerPrice0 || tokenPricesApi?.[0] || tokenPricesV2[0] || 0,
    [Field.CURRENCY_B]: indexerPrice1 || tokenPricesApi?.[1] || tokenPricesV2[1] || 0,
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

  const disabled = !enabled || !tokenA || !tokenB

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
