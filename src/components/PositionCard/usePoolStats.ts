import { JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useTotalSupply } from 'data/TotalSupply'
import { useTradingFee } from 'hooks/useTradingFee'
import { useMemo } from 'react'
import { internalService } from 'services'
import moment from 'moment'

type Token = {
  __typename?: 'token'
  address: string
  chainId: number
  decimals: number
  name: string
  price: number
  priceFeedId?: string | null
  symbol: string
  totalSupply: number
}

export type PairStats = {
  __typename?: 'pair'
  chainId: number
  address: string
  fee: number
  totalSupply: number
  reserve0: number
  reserve1: number
  tvl: number
  apr: number
  volumeDay: number
  volume7Day: number
  updatedAt: number
  token0?: Token | null
  token1?: Token | null
}

type Props = {
  pair: Pair
  pairStats?: PairStats
}

export const usePoolStats = ({ pair, pairStats }: Props) => {
  const { data: poolStats } = useQuery({
    queryKey: ['getPoolStats', pair.liquidityToken.address],
    queryFn: () => {
      return internalService.getPoolStats(pair)
    },
  })

  const shouldUseIndexer =
    useMemo(() => {
      if (pairStats?.updatedAt) {
        const diffMinutes = moment().diff(moment.unix(pairStats.updatedAt), 'minutes')
        return diffMinutes < 60
      }
      return !!pairStats
    }, [pairStats]) && !!pairStats

  const tradingFee = shouldUseIndexer ? pairStats.fee * 100 : useTradingFee({ pair })

  const totalSupply = shouldUseIndexer
    ? new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(Math.round(pairStats.totalSupply * 10 ** pair.liquidityToken.decimals)),
      )
    : useTotalSupply(pair.liquidityToken)

  return {
    tradingFee,
    totalSupply,
    feeAPR: (shouldUseIndexer ? pairStats.apr : poolStats?.apy) || 0,
    volume24h: (shouldUseIndexer ? pairStats.volumeDay : poolStats?.volume24h) || 0,
    volume7d: (shouldUseIndexer ? pairStats.volume7Day : poolStats?.volume7d) || 0,
  }
}
