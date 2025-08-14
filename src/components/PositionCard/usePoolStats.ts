import { JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useTotalSupply } from 'data/TotalSupply'
import { useTradingFee } from 'hooks/useTradingFee'
import { internalService } from 'services'

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
    enabled: false,
  })

  const tradingFee = pairStats ? pairStats.fee * 100 : useTradingFee({ pair })

  const totalSupply = pairStats
    ? new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(Math.round(pairStats.totalSupply * 10 ** pair.liquidityToken.decimals)),
      )
    : useTotalSupply(pair.liquidityToken)

  return {
    tradingFee,
    feeAPR: (poolStats?.apy ?? pairStats?.apr) || 0,
    volume24h: (poolStats?.volume24h ?? pairStats?.volumeDay) || 0,
    volume7d: (poolStats?.volume7d ?? pairStats?.volume7Day) || 0,
    totalSupply,
  }
}
