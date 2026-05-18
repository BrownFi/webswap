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
  /** Optional affiliate fee config. When `feeReceiver` is set, Kyber's
   *  router skims `feeAmount` (in bps when `isInBps=true`) from the
   *  trade's input or output side and forwards it to the receiver.
   *  All three fields are required together — leaving `feeReceiver`
   *  unset = no fee, no behavior change. */
  feeReceiver?: string
  /** 'currency_in' (skim from amount user pays) or 'currency_out' (skim
   *  from amount user receives). Output side is the cleaner UX choice. */
  chargeFeeBy?: 'currency_in' | 'currency_out'
  /** When `isInBps=true`, expressed in basis points (50 = 0.5%). */
  feeAmount?: number
  /** Defaults to true — express feeAmount as bps rather than raw amount. */
  isInBps?: boolean
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
  const body: Record<string, unknown> = {
    routeSummary: params.routeSummary,
    sender: params.sender,
    recipient: params.recipient,
    slippageTolerance: params.slippageBps,
    deadline: params.deadline,
    source: CLIENT_ID,
  }
  // Only include fee fields when a receiver is configured. Kyber rejects
  // partial fee configs (feeAmount without feeReceiver, etc.) — easier to
  // gate the whole block on the receiver presence so omitted = no fee.
  if (params.feeReceiver && params.feeAmount && params.feeAmount > 0) {
    body.feeReceiver = params.feeReceiver
    body.chargeFeeBy = params.chargeFeeBy ?? 'currency_out'
    body.feeAmount = String(params.feeAmount)
    body.isInBps = params.isInBps ?? true
  }
  const res = await timedFetch(url, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Kyber /route/build HTTP ${res.status}`)
  return res.json()
}
