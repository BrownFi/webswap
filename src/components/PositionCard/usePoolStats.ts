import { JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useTotalSupply } from 'data/TotalSupply'
import { useTradingFee } from 'hooks/useTradingFee'
import { internalService } from 'services'

type Token = {
  address: string
  chainId: number
  decimals: number
  name: string
  price: number
  priceFeedId: string
  symbol: string
  totalSupply: number
  __typename: 'token'
}

export type PairStats = {
  address: string
  apr: number
  chainId: number
  fee: number
  lpPrice: number
  reserve0: number
  reserve1: number
  totalSupply: number
  totalTxn: string
  tvl: number
  token0: Token
  token1: Token
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

  const tradingFee = pairStats ? pairStats.fee * 100 : useTradingFee({ pair })

  const totalSupply = pairStats
    ? new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(Math.round(pairStats.totalSupply * 10 ** pair.liquidityToken.decimals)),
      )
    : useTotalSupply(pair.liquidityToken)

  return {
    tradingFee,
    feeAPR: poolStats?.apy || 0,
    volume24h: poolStats?.volume24h ?? 0,
    volume7d: poolStats?.volume7d ?? 0,
    totalSupply,
  }
}
