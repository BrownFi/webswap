import { ChainId } from '@brownfi/sdk'
import axios from 'axios'

type OneOrMany<T> = T | T[]

const KYBER_ZAP_CLIENT_ID = 'BrownFi'
const KYBER_ZAP_DEX_ID = '81'

const chainMap: Partial<Record<ChainId, string>> = {
  [ChainId.BERA_MAINNET]: 'berachain',
  [ChainId.LINEA_MAINNET]: 'linea',
}

const client = axios.create({
  baseURL: process.env.REACT_APP_KYBERSWAP_ZAP_API_URL,
  timeout: 30_000,
  headers: {
    'x-client-id': KYBER_ZAP_CLIENT_ID,
  },
})

const toArray = (value: OneOrMany<string>) => (Array.isArray(value) ? value : [value])

type KyberZapRoutePoolDetails = {
  category: string
  newLiquidity: string
  uniswapV2?: {
    reserve0: string
    newReserve0: string
    reserve1: string
    newReserve1: string
  }
}

type KyberZapRoutePositionDetails = {
  addedLiquidity: string
  addedAmountUsd: string
}

type KyberZapProtocolFeeAction = {
  type: 'ACTION_TYPE_PROTOCOL_FEE'
  protocolFee: {
    pcm: number
    tokens: Array<{
      address: string
      amount: string
      amountUsd: string
    }>
  }
}

type KyberZapAggregatorSwapAction = {
  type: 'ACTION_TYPE_AGGREGATOR_SWAP'
  aggregatorSwap: {
    swaps: Array<{
      tokenIn: {
        address: string
        amount: string
        amountUsd: string
      }
      tokenOut: {
        address: string
        amount: string
        amountUsd: string
      }
    }>
  }
}

type KyberZapPoolSwapAction = {
  type: 'ACTION_TYPE_POOL_SWAP'
  poolSwap: {
    swaps: Array<{
      tokenIn: {
        address: string
        amount: string
        amountUsd: string
      }
      tokenOut: {
        address: string
        amount: string
        amountUsd: string
      }
      poolAddress: string
    }>
  }
}

type KyberZapAddLiquidityAction = {
  type: 'ACTION_TYPE_ADD_LIQUIDITY'
  addLiquidity: {
    tokens: Array<{
      address: string
      amount: string
      amountUsd: string
    }>
    token0: {
      address: string
      amount: string
      amountUsd: string
    }
    token1: {
      address: string
      amount: string
      amountUsd: string
    }
  }
}

type KyberZapRouteAction =
  | KyberZapProtocolFeeAction
  | KyberZapAggregatorSwapAction
  | KyberZapPoolSwapAction
  | KyberZapAddLiquidityAction
  | { type: string; [key: string]: unknown }

type KyberZapRouteDetails = {
  initialAmountUsd: string
  finalAmountUsd: string
  priceImpact: number
  suggestedSlippage: number
  actions: KyberZapRouteAction[]
}

type KyberZapRouteData = {
  poolDetails: KyberZapRoutePoolDetails
  positionDetails?: KyberZapRoutePositionDetails
  zapDetails: KyberZapRouteDetails
  route: string
  routerAddress: string
  gas: string
  gasUsd: string
}

type KyberZapRouteResponse = {
  message: string
  data: KyberZapRouteData
}

type KyberZapRouteParams = {
  chainId: ChainId
  poolId: string
  poolToken0: string
  poolToken1: string
  positionId?: string
  tokensIn: OneOrMany<string>
  amountsIn: OneOrMany<string>
  slippage: number | string
}

const getKyberZapInRoute = async ({
  chainId,
  poolId,
  poolToken0,
  poolToken1,
  tokensIn,
  amountsIn,
  slippage,
  positionId,
}: KyberZapRouteParams): Promise<KyberZapRouteData> => {
  const chainName = chainMap[chainId]

  const response = await client.get<KyberZapRouteResponse>(`/${chainName}/api/v1/in/route`, {
    params: {
      dex: KYBER_ZAP_DEX_ID,
      'pool.id': poolId,
      'pool.token0': poolToken0,
      'pool.token1': poolToken1,
      'position.id': positionId,
      tokensIn: toArray(tokensIn).join(','),
      amountsIn: toArray(amountsIn).join(','),
      slippage: String(slippage),
    },
  })

  return response.data.data
}

type KyberBuildZapRouteData = {
  routerAddress: string
  callData: string
  value: string
}

type KyberBuildZapRouteResponse = {
  message: string
  data: KyberBuildZapRouteData
}

type KyberBuildZapRouteRequest = {
  chainId: ChainId
  sender: string
  recipient: string
  route: string
}

const buildKyberZapInRoute = async ({
  chainId,
  recipient,
  sender,
  route,
}: KyberBuildZapRouteRequest): Promise<KyberBuildZapRouteData> => {
  const chainName = chainMap[chainId]

  const response = await client.post<KyberBuildZapRouteResponse>(`/${chainName}/api/v1/in/route/build`, {
    recipient,
    sender,
    route,
    source: KYBER_ZAP_CLIENT_ID,
  })

  return response.data.data
}

export const kyberZapService = {
  getKyberZapInRoute,
  buildKyberZapInRoute,
}
