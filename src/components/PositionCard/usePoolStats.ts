import { ChainId, JSBI, Pair, TokenAmount } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useTotalSupply } from 'data/TotalSupply'
import { useActiveWeb3React } from 'hooks'
import { useTradingFee } from 'hooks/useTradingFee'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { apiV2Service } from 'services'
import { graphqlFetcher } from 'utils/graphql'

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

export const merklCampaignPool: string[] = [
  '0xA87E2c65F2b79164bab690Ec6808431D8c419598'.toLowerCase(), // WETH/USDC.e on LINEA
]

type Props = {
  pair: Pair
  pairStats?: PairStats
  enableFetchDetail?: boolean
}

export const usePoolStats = ({ pair, pairStats, enableFetchDetail }: Props) => {
  const { account } = useActiveWeb3React()

  const { data } = useQuery<{
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
  }>({
    queryKey: ['PairAccount', pair?.chainId, pair?.liquidityToken.address, account],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairAccount',
        query: GET_PAIR_ACCOUNT,
        variables: {
          chainId: pair.chainId,
          id: `${account!.toLowerCase()}-${pair.liquidityToken.address.toLowerCase()}`,
        },
      }),
    enabled: !!enableFetchDetail && !!account && !!pair?.chainId && !!pairStats,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })

  const shouldUseIndexer =
    useMemo(() => {
      if (pairStats?.updatedAt) {
        const diffMinutes = dayjs().diff(dayjs.unix(pairStats.updatedAt), 'minute')
        return diffMinutes < 120 // 2 hours — fall back to RPC if indexer is stale
      }
      return !!pairStats
    }, [pairStats]) && !!pairStats

  // BGT APR
  const { data: poolApr } = useQuery({
    queryKey: ['getBgtApr', pair.liquidityToken.address],
    queryFn: () => {
      return apiV2Service.getPoolBgt({ address: pair.liquidityToken.address })
    },
    enabled: pair.chainId === ChainId.BERA_MAINNET && !!pairBGT[pair.liquidityToken.address],
  })

  // Merkl Campaign APR
  const { data: merklCampaignApr } = useQuery({
    queryKey: ['getMerklCampaignApr', pair.liquidityToken.address],
    queryFn: () => {
      return apiV2Service.getMerklCampaignApr({ address: pair.liquidityToken.address })
    },
    enabled:
      pair.chainId === ChainId.LINEA_MAINNET && merklCampaignPool.includes(pair.liquidityToken.address.toLowerCase()),
  })

  const rpcTradingFee = useTradingFee({ pair })
  const rpcTotalSupply = useTotalSupply(shouldUseIndexer ? undefined : pair.liquidityToken)

  const tradingFee = shouldUseIndexer ? pairStats.fee * 100 : rpcTradingFee
  const totalSupply = shouldUseIndexer
    ? new TokenAmount(
        pair.liquidityToken,
        JSBI.BigInt(Math.round(pairStats.totalSupply * 10 ** pair.liquidityToken.decimals)),
      )
    : rpcTotalSupply

  return {
    tradingFee,
    totalSupply,
    feeAPR: (shouldUseIndexer ? pairStats.apr * (1 - pairStats.protocolFee) : 0) || 0,
    bgtAPR: (poolApr?.apr || 0) * 100,
    volume24h: (shouldUseIndexer ? pairStats.volumeDay : 0) || 0,
    volume7d: (shouldUseIndexer ? pairStats.volume7Day : 0) || 0,
    shouldUseIndexer,
    pairAccount: data?.pairAccount,
    merklCampaignApr: merklCampaignApr?.apr || 0,
  }
}
