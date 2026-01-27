import { ChainId, JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useTotalSupply } from 'data/TotalSupply'
import { useActiveWeb3React } from 'hooks'
import { useTradingFee } from 'hooks/useTradingFee'
import moment from 'moment'
import { useMemo } from 'react'
import { apiV1Service, apiV2Service } from 'services'
import useSWR from 'swr'
import { graphqlFetcher } from 'utils/swr'

type Token = {
  __typename?: 'token'
  id: string
  decimals: number
  name: string
  price: number
  priceFeedId?: string | null
  symbol: string
  totalSupply: number
}

export type PairStats = {
  __typename?: 'pair'
  id: string
  fee: number
  protocolFee: number
  feeDay: number
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
  query PairAccount($id: String!) {
    pairAccount(
      id: $id
    ) {
      lpPortfolio
      basePortfolio
      bnhPortfolio
      stakeLP
      netPnL
      netBnHPnL
      unrealizedPnL
      unrealizedBnHPnL
    }
  }
`

const pairBGT: Record<string, string[]> = {
  '0xd932c344e21ef6C3a94971bf4D4cC71304E2a66C': ['0x7488174f1f518caf2faae4f30cbba65ea57cf4f9'], // BERA/HONEY
  '0xd57Da672354905B9E42Df077Df77E554dC5Fd1Cc': ['0xd57Da672354905B9E42Df077Df77E554dC5Fd1Cc'], // BERA/USDC.e
}

type Props = {
  pair: Pair
  pairStats?: PairStats
  enableFetchDetail?: boolean
}

export const usePoolStats = ({ pair, pairStats, enableFetchDetail }: Props) => {
  const { account } = useActiveWeb3React()

  const pairAccountKey =
    enableFetchDetail && account && pair?.chainId && pairStats
      ? (['PairAccount', pair.chainId, pair.liquidityToken.address, account] as const)
      : null

  const { data } = useSWR<
    {
      pairAccount: {
        lpPortfolio: number
        basePortfolio: number
        bnhPortfolio: number
        stakeLP: number
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
        variables: { chainId, id: `${address}-${pairAddress}` },
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

  // Api A Lien
  const { data: poolStats } = useQuery({
    queryKey: ['getPoolStats', pair.liquidityToken.address],
    queryFn: () => {
      return apiV1Service.getPoolStats(pair)
    },
    enabled: !shouldUseIndexer,
  })

  // Apt BGT
  const { data: poolApr } = useQuery({
    queryKey: ['getBgtApr', pair.liquidityToken.address],
    queryFn: () => {
      return apiV2Service.getPoolBgt({ address: pair.liquidityToken.address })
    },
    enabled: pair.chainId === ChainId.BERA_MAINNET && !!pairBGT[pair.liquidityToken.address],
  })

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
    feeAPR: (shouldUseIndexer ? pairStats.apr * (1 - pairStats.protocolFee) : poolStats?.apy) || 0,
    bgtAPR: (poolApr?.apr || 0) * 100,
    volume24h: (shouldUseIndexer ? pairStats.volumeDay : poolStats?.volume24h) || 0,
    volume7d: (shouldUseIndexer ? pairStats.volume7Day : poolStats?.volume7d) || 0,
    shouldUseIndexer,
    pairAccount: data?.pairAccount,
  }
}
