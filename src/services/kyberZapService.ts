import { ChainId } from '@brownfi/sdk'
import { KYBER_ZAP_CHAIN_SLUG } from './aggregators/kyber/chains'

type OneOrMany<T> = T | T[]

const KYBER_ZAP_CLIENT_ID = 'BrownFi'
const KYBER_ZAP_DEX_ID = 'DEX_BROWNFI'
const BASE_URL = import.meta.env.VITE_KYBERSWAP_ZAP_API_URL

// Re-use the slug map declared in the aggregator folder so adapter + legacy
// callers stay in lockstep when new chains turn zap on. The aggregator folder
// is the source of truth.
const chainMap = KYBER_ZAP_CHAIN_SLUG

async function fetchJson<T>(path: string, options?: { params?: Record<string, any>; timeout?: number; retries?: number }): Promise<T> {
  const maxRetries = options?.retries ?? 1
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const url = new URL(path, BASE_URL)
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value))
      })
    }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 30_000)
    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { 'x-client-id': KYBER_ZAP_CLIENT_ID },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    } catch (e) {
      lastError = e as Error
      if (attempt < maxRetries) continue
    } finally {
      clearTimeout(timeoutId)
    }
  }
  throw lastError
}

async function postJson<T>(path: string, data: unknown, options?: { timeout?: number }): Promise<T> {
  const url = new URL(path, BASE_URL)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 30_000)
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': KYBER_ZAP_CLIENT_ID,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

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
  slippage: string
}

const getKyberZapInRoute = async ({
  chainId,
  poolId,
  poolToken0,
  poolToken1,
  positionId,
  tokensIn,
  amountsIn,
  slippage,
}: KyberZapRouteParams): Promise<KyberZapRouteData> => {
  const chainName = chainMap[chainId]

  const response = await fetchJson<KyberZapRouteResponse>(`/${chainName}/api/v1/in/route`, {
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

  return response.data
}

type KyberZapOutRouteParams = {
  chainId: ChainId
  poolId: string
  positionId: string
  tokenOut: string
  liquidityOut: string
  slippage: string
}

const getKyberZapOutRoute = async ({
  chainId,
  poolId,
  positionId,
  tokenOut,
  liquidityOut,
  slippage,
}: KyberZapOutRouteParams): Promise<KyberZapRouteData> => {
  const chainName = chainMap[chainId]

  const response = await fetchJson<KyberZapRouteResponse>(`/${chainName}/api/v1/out/route`, {
    params: {
      dexFrom: KYBER_ZAP_DEX_ID,
      'poolFrom.id': poolId,
      'positionFrom.id': positionId,
      tokenOut,
      liquidityOut,
      slippage,
    },
  })

  return response.data
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

  const response = await postJson<KyberBuildZapRouteResponse>(`/${chainName}/api/v1/in/route/build`, {
    recipient,
    sender,
    route,
    source: KYBER_ZAP_CLIENT_ID,
  })

  return response.data
}

const buildKyberZapOutRoute = async ({
  chainId,
  recipient,
  sender,
  route,
}: KyberBuildZapRouteRequest): Promise<KyberBuildZapRouteData> => {
  const chainName = chainMap[chainId]

  const response = await postJson<KyberBuildZapRouteResponse>(`/${chainName}/api/v1/out/route/build`, {
    recipient,
    sender,
    route,
    source: KYBER_ZAP_CLIENT_ID,
  })

  return response.data
}

export const kyberZapService = {
  getKyberZapInRoute,
  getKyberZapOutRoute,
  buildKyberZapInRoute,
  buildKyberZapOutRoute,
}
