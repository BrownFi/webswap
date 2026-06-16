import { ChainId, isV3Like } from '@brownfi/sdk'
import { KYBER_ZAP_CHAIN_SLUG } from './aggregators/kyber/chains'

type OneOrMany<T> = T | T[]

const KYBER_ZAP_CLIENT_ID = 'BrownFi'
const KYBER_ZAP_DEX_ID = 'DEX_BROWNFI'
const BASE_URL = import.meta.env.VITE_KYBERSWAP_ZAP_API_URL

// BrownFi V3 (v3-final) zaps go through Kyber's "Earn" surface: dex id "84",
// client-id "kyberswap-earn", and — until Kyber promotes dex=84 to prod — the
// pre-prod endpoint. Separate env var so the prod migration is a config-only
// flip; defaults to pre-prod so V3 zap works on test envs without extra config.
const KYBER_ZAP_CLIENT_ID_V3 = 'kyberswap-earn'
const KYBER_ZAP_DEX_ID_V3 = '84'
const BASE_URL_V3 =
  (import.meta.env.VITE_KYBERSWAP_ZAP_API_URL_V3 as string | undefined) ||
  'https://pre-zap-api.kyberengineering.io'

type ZapCfg = { dexId: string; clientId: string; baseUrl: string; isV3: boolean }
// version 3 (pilot) + 4 (official) are V3-generation pools → Kyber Earn (dex 84).
// Default (undefined / V2) preserves the legacy prod V2 zap behavior exactly.
const zapCfg = (version?: number): ZapCfg =>
  isV3Like(version ?? 2)
    ? { dexId: KYBER_ZAP_DEX_ID_V3, clientId: KYBER_ZAP_CLIENT_ID_V3, baseUrl: BASE_URL_V3, isV3: true }
    : { dexId: KYBER_ZAP_DEX_ID, clientId: KYBER_ZAP_CLIENT_ID, baseUrl: BASE_URL, isV3: false }

// Re-use the slug map declared in the aggregator folder so adapter + legacy
// callers stay in lockstep when new chains turn zap on. The aggregator folder
// is the source of truth.
const chainMap = KYBER_ZAP_CHAIN_SLUG

async function fetchJson<T>(path: string, options?: { params?: Record<string, any>; timeout?: number; retries?: number }, cfg: ZapCfg = zapCfg()): Promise<T> {
  const maxRetries = options?.retries ?? 1
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const url = new URL(path, cfg.baseUrl)
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
        headers: { 'x-client-id': cfg.clientId },
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

async function postJson<T>(path: string, data: unknown, options?: { timeout?: number }, cfg: ZapCfg = zapCfg()): Promise<T> {
  const url = new URL(path, cfg.baseUrl)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 30_000)
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cfg.clientId,
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
  // Verified empirically against the live API: when `position.id` is the
  // user's wallet address (V2-style pools have no NFT position), the route
  // succeeds without `pool.token0` / `pool.token1`. The earlier impl sent
  // them but the response is byte-identical without — keep the surface
  // narrow so future Kyber changes don't bite us through stale params.
  positionId: string
  tokensIn: OneOrMany<string>
  amountsIn: OneOrMany<string>
  slippage: string
  /** BrownFi pool version — 3/4 (V3-gen) route to Kyber Earn (dex 84); else V2. */
  version?: number
}

const getKyberZapInRoute = async ({
  chainId,
  poolId,
  positionId,
  tokensIn,
  amountsIn,
  slippage,
  version,
}: KyberZapRouteParams): Promise<KyberZapRouteData> => {
  const chainName = chainMap[chainId]
  const cfg = zapCfg(version)

  const response = await fetchJson<KyberZapRouteResponse>(`/${chainName}/api/v1/in/route`, {
    params: {
      dex: cfg.dexId,
      'pool.id': poolId,
      'position.id': positionId,
      tokensIn: toArray(tokensIn).join(','),
      amountsIn: toArray(amountsIn).join(','),
      slippage: String(slippage),
    },
  }, cfg)

  return response.data
}

type KyberZapOutRouteParams = {
  chainId: ChainId
  poolId: string
  positionId: string
  tokenOut: string
  liquidityOut: string
  slippage: string
  /** BrownFi pool version — 3/4 (V3-gen) route to Kyber Earn (dex 84); else V2. */
  version?: number
}

const getKyberZapOutRoute = async ({
  chainId,
  poolId,
  positionId,
  tokenOut,
  liquidityOut,
  slippage,
  version,
}: KyberZapOutRouteParams): Promise<KyberZapRouteData> => {
  const chainName = chainMap[chainId]
  const cfg = zapCfg(version)

  const response = await fetchJson<KyberZapRouteResponse>(`/${chainName}/api/v1/out/route`, {
    params: {
      dexFrom: cfg.dexId,
      'poolFrom.id': poolId,
      'positionFrom.id': positionId,
      tokenOut,
      liquidityOut,
      slippage,
    },
  }, cfg)

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
  /** Unix seconds. When omitted, Kyber applies an internal default; verified
   *  empirically that supplying it changes the embedded calldata (offset
   *  ~4160), so the user's slippage/deadline preference is now honored
   *  end-to-end instead of silently dropped. A past timestamp makes the
   *  API reject the build outright, so always pass a future value. */
  deadline?: number
  /** BrownFi pool version — 3/4 (V3-gen) build through Kyber Earn (dex 84). */
  version?: number
}

const buildKyberZapInRoute = async ({
  chainId,
  recipient,
  sender,
  route,
  deadline,
  version,
}: KyberBuildZapRouteRequest): Promise<KyberBuildZapRouteData> => {
  const chainName = chainMap[chainId]
  const cfg = zapCfg(version)

  const response = await postJson<KyberBuildZapRouteResponse>(`/${chainName}/api/v1/in/route/build`, {
    recipient,
    sender,
    route,
    source: cfg.clientId,
    ...(typeof deadline === 'number' && deadline > 0 ? { deadline } : {}),
  }, undefined, cfg)

  return response.data
}

const buildKyberZapOutRoute = async ({
  chainId,
  recipient,
  sender,
  route,
  deadline,
  version,
}: KyberBuildZapRouteRequest): Promise<KyberBuildZapRouteData> => {
  const chainName = chainMap[chainId]
  const cfg = zapCfg(version)

  const response = await postJson<KyberBuildZapRouteResponse>(`/${chainName}/api/v1/out/route/build`, {
    recipient,
    sender,
    route,
    source: cfg.clientId,
    // V3 (Kyber Earn) out/migrate builds require burnNft; BrownFi LP is an
    // ERC-20 (not an NFT position) so it's always false. V2 omits the field.
    ...(cfg.isV3 ? { burnNft: false } : {}),
    ...(typeof deadline === 'number' && deadline > 0 ? { deadline } : {}),
  }, undefined, cfg)

  return response.data
}

export const kyberZapService = {
  getKyberZapInRoute,
  getKyberZapOutRoute,
  buildKyberZapInRoute,
  buildKyberZapOutRoute,
}
