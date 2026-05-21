/**
 * Thin REST client for the Kyber Aggregator API (sibling of kyberZapService,
 * but a different surface — /api/v1/routes + /api/v1/route/build).
 *
 * Anonymous mode for now (x-client-id only). To enable an API key later, set
 * VITE_KYBERSWAP_AGG_API_KEY in env — when present we send it as
 * `x-api-key`. The base URL is overridable via VITE_KYBERSWAP_AGG_API_URL so
 * staging vs production can point at different deployments.
 */
import { ChainId } from '@brownfi/sdk'
import { KYBER_AGGREGATOR_CHAIN_SLUG } from './chains'

const CLIENT_ID = 'BrownFi'
const DEFAULT_BASE_URL = 'https://aggregator-api.kyberswap.com'

const BASE_URL = (import.meta.env.VITE_KYBERSWAP_AGG_API_URL as string | undefined) || DEFAULT_BASE_URL
const API_KEY = import.meta.env.VITE_KYBERSWAP_AGG_API_KEY as string | undefined

function chainPath(chainId: ChainId): string {
  const slug = KYBER_AGGREGATOR_CHAIN_SLUG[chainId]
  if (!slug) throw new Error(`Kyber aggregator: chain ${chainId} not supported`)
  return slug
}

function headers(): HeadersInit {
  const h: Record<string, string> = { 'x-client-id': CLIENT_ID }
  if (API_KEY) h['x-api-key'] = API_KEY
  return h
}

async function timedFetch(url: string, init: RequestInit, timeoutMs = 15_000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

// ---- /routes (quote) ----

export interface KyberRoutesParams {
  chainId: ChainId
  tokenIn: string
  tokenOut: string
  amountIn: string // wei
  /** native gas estimation flag — we pass 'true' so the gas field comes back. */
  gasInclude?: boolean
  saveGas?: boolean
  /** Affiliate fee config (all four together). When set, Kyber computes a
   *  fee-aware quote — `amountOut` accounts for the skim on the chosen
   *  side. The returned `routeSummary` embeds `extraFee`, which is then
   *  passed through to /route/build unchanged. Per Kyber docs, fee params
   *  belong on /routes (the quote), NOT /route/build (the calldata) —
   *  passing them at build time gets silently ignored OR the router
   *  reverts with "Exceeded desc.amount". */
  feeReceiver?: string
  feeAmount?: number
  chargeFeeBy?: 'currency_in' | 'currency_out'
  isInBps?: boolean
}

export interface KyberRouteSummary {
  tokenIn: string
  amountIn: string
  amountInUsd?: string
  tokenOut: string
  amountOut: string
  amountOutUsd?: string
  gas?: string
  gasPrice?: string
  gasUsd?: string
  /** opaque — feed back into /route/build */
  route?: unknown
  routeID?: string
  // …Kyber emits more, but Swap only needs the above
}

export interface KyberRoutesResponse {
  code: number
  message?: string
  data?: {
    routeSummary: KyberRouteSummary
    routerAddress: string
  }
}

export async function getRoutes(params: KyberRoutesParams): Promise<KyberRoutesResponse> {
  const search = new URLSearchParams({
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    amountIn: params.amountIn,
    gasInclude: String(params.gasInclude ?? true),
    saveGas: String(params.saveGas ?? false),
  })
  // Fee fields go on the QUOTE call so amountIn/amountOut reflect the
  // post-fee economics. Kyber embeds the config into routeSummary.extraFee
  // in the response, which travels through to /route/build unchanged.
  if (params.feeReceiver && params.feeAmount && params.feeAmount > 0) {
    search.set('feeReceiver', params.feeReceiver)
    search.set('feeAmount', String(params.feeAmount))
    search.set('chargeFeeBy', params.chargeFeeBy ?? 'currency_out')
    search.set('isInBps', String(params.isInBps ?? true))
  }
  const url = `${BASE_URL}/${chainPath(params.chainId)}/api/v1/routes?${search.toString()}`
  const res = await timedFetch(url, { headers: headers() })
  if (!res.ok) throw new Error(`Kyber /routes HTTP ${res.status}`)
  return res.json()
}

// ---- /route/build (calldata) ----

export interface KyberBuildParams {
  chainId: ChainId
  routeSummary: unknown
  sender: string
  recipient: string
  /** basis points, 50 = 0.5% */
  slippageBps: number
  /** unix seconds */
  deadline: number
  // NOTE: no fee fields here. Per Kyber docs, affiliate fee config lives
  // on the /routes (quote) call and is embedded into routeSummary.extraFee
  // by Kyber's server. /route/build just consumes the routeSummary as-is.
}

export interface KyberBuildResponse {
  code: number
  message?: string
  data?: {
    amountIn: string
    amountInUsd?: string
    amountOut: string
    amountOutUsd?: string
    gas?: string
    gasUsd?: string
    outputChange?: { amount: string; percent: number; level: number }
    routerAddress: string
    data: string // tx calldata
  }
}

export async function buildRoute(params: KyberBuildParams): Promise<KyberBuildResponse> {
  const url = `${BASE_URL}/${chainPath(params.chainId)}/api/v1/route/build`
  // Fee is already embedded in routeSummary.extraFee from the /routes call.
  // Re-passing fee fields at this layer triggers "Exceeded desc.amount"
  // on-chain because the router's amount-consistency check would see the
  // fee applied twice.
  // Kyber's docs cap slippageTolerance at 2000 bps (20%). The live API is
  // actually more permissive — verified empirically that 2100 succeeds — but
  // a very high value (~9999) requires `ignoreCappedSlippage: true` or the
  // request is rejected with code 4000. Our FE clamps to 5000 bps via the
  // user-reducer, so any value > 2000 lands in the gray zone where Kyber
  // currently accepts it but the docs say it shouldn't. Set the override
  // explicitly to match the docs' contract and future-proof against Kyber
  // tightening enforcement.
  const ignoreCappedSlippage = params.slippageBps > 2000
  const body: Record<string, unknown> = {
    routeSummary: params.routeSummary,
    sender: params.sender,
    recipient: params.recipient,
    slippageTolerance: params.slippageBps,
    deadline: params.deadline,
    source: CLIENT_ID,
    ...(ignoreCappedSlippage ? { ignoreCappedSlippage: true } : {}),
  }
  const res = await timedFetch(url, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Kyber /route/build HTTP ${res.status}`)
  return res.json()
}
