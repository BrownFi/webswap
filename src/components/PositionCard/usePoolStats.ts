import { JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useTotalSupply } from 'data/TotalSupply'
import { useActiveWeb3React } from 'hooks'
import { useTradingFee } from 'hooks/useTradingFee'
import moment from 'moment'
import { useMemo } from 'react'
import { internalService } from 'services'
import useSWR from 'swr'
import { graphqlFetcher } from 'utils/swr'

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

const GET_PAIR_ACCOUNT = `
  query PairAccount($chainId: Float!, $pairAddress: String!, $address: String!) {
    pairAccount(
      chainId: $chainId
      pairAddress: $pairAddress
      address: $address
    ) {
      lpPortfolio
      basePortfolio
      bnhPortfolio
      netPnL
      netBnHPnL
      unrealizedPnL
      unrealizedBnHPnL
    }
  }
`

type Props = {
  pair: Pair
  pairStats?: PairStats
}

export const usePoolStats = ({ pair, pairStats }: Props) => {
  const { account } = useActiveWeb3React()
  // Api A Lien
  const { data: poolStats } = useQuery({
    queryKey: ['getPoolStats', pair.liquidityToken.address],
    queryFn: () => {
      return internalService.getPoolStats(pair)
    },
  })

  const pairAccountKey =
    account && pair?.chainId && pairStats
      ? (['PairAccount', pair.chainId, pair.liquidityToken.address, account] as const)
      : null

  const { data } = useSWR<
    {
      pairAccount: {
        lpPortfolio: number
        basePortfolio: number
        bnhPortfolio: number
        netPnL: number
        netBnHPnL: number
        unrealizedPnL: number
        unrealizedBnHPnL: number
      }
    },
    unknown,
    typeof pairAccountKey
  >(
    pairAccountKey,
    ([, chainId, pairAddress, address]) =>
      graphqlFetcher({
        operationName: 'PairAccount',
        query: GET_PAIR_ACCOUNT,
        variables: { chainId, pairAddress, address },
      }),
    {
      refreshInterval: 1 * 60 * 1000,
    },
  )

  const shouldUseIndexer =
    useMemo(() => {
      if (pairStats?.updatedAt) {
        const diffMinutes = moment().diff(moment.unix(pairStats.updatedAt), 'minutes')
        return diffMinutes < 60 * 24 * 30
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
    unrealizedPnL: data?.pairAccount?.unrealizedPnL,
    simulatedPnL: (data?.pairAccount?.bnhPortfolio || 0) - (data?.pairAccount?.basePortfolio || 0),
    shouldUseIndexer,
  }
}
