import { JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'

import { internalService } from 'services'

import { useTradingFee } from 'hooks/useTradingFee'

import { useTotalSupply } from 'data/TotalSupply'

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
  bnhPrice: number
  bnhReserve0: number
  bnhReserve1: number
  bnhTotalSupply: number
  chainId: number
  fee: number
  feeDay: number
  k: number
  lambda: number
  lpPrice: number
  netPnL: number
  protocolFee: number
  reserve0: number
  reserve0USD: number
  reserve1: number
  reserve1USD: number
  totalSupply: number
  totalTxn: string
  tvl: number
  __typename: 'pair'
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
