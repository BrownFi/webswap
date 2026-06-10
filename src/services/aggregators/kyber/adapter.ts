/**
 * Kyber Aggregator adapter — implements AggregatorAdapter.
 *
 * Normalizes the Kyber API responses into the orchestration's shape. The
 * `routeSummary` field is opaque and gets handed back into `buildSwap()` so
 * Kyber can mint matching calldata.
 */
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { ChainId, ETHER, Token } from '@brownfi/sdk'
import type {
  AggregatorAdapter,
  AggregatorQuote,
  BuildSwapParams,
  BuildSwapResult,
  BrownFiVersion,
  QuoteParams,
} from '../types'
import { isKyberSupported } from './chains'
import { buildRoute, getRoutes, KyberRouteSummary } from './api'

// Kyber doesn't return an explicit quote TTL. Production routes typically
// stay valid for ~30–60s; we mark them stale at 30s to refetch before sign
// rather than risk a build call against an expired route.
const KYBER_QUOTE_TTL_SECONDS = 30

// Kyber expects the native sentinel for ETH/BERA/etc.
const NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// Affiliate fee config — env-driven so it can be set per deployment in
// Vercel without touching code. Empty defaults = no fee, no behavior
// change. When VITE_KYBER_FEE_RECEIVER is set, every Kyber build call
// includes the fee fields and Kyber's router skims the configured bps
// from the chosen side and forwards them to the receiver wallet.
const KYBER_FEE_RECEIVER = (import.meta.env.VITE_KYBER_FEE_RECEIVER as string | undefined) ?? ''
const KYBER_FEE_BPS = Number(import.meta.env.VITE_KYBER_FEE_BPS ?? '0')
const KYBER_FEE_SIDE =
  (import.meta.env.VITE_KYBER_FEE_SIDE as 'currency_in' | 'currency_out' | undefined) ?? 'currency_out'

export function getKyberFeeConfig() {
  if (!KYBER_FEE_RECEIVER || !KYBER_FEE_BPS || KYBER_FEE_BPS <= 0) return undefined
  return {
    feeReceiver: KYBER_FEE_RECEIVER,
    feeAmount: KYBER_FEE_BPS,
    chargeFeeBy: KYBER_FEE_SIDE,
    isInBps: true as const,
  }
}

function currencyToAddress(currency: QuoteParams['tokenIn']): string {
  if (currency === ETHER) return NATIVE_SENTINEL
  if (currency instanceof Token) return currency.address
  return AddressZero
}

function applySlippage(amountOut: BigNumber, slippageBps: number): BigNumber {
  // amountOutMin = amountOut * (10_000 - slippageBps) / 10_000
  return amountOut.mul(10_000 - slippageBps).div(10_000)
}

export const kyberAggregator: AggregatorAdapter<KyberRouteSummary> = {
  id: 'kyber',
  name: 'Kyber',

  isSupported(chainId: ChainId, version: BrownFiVersion) {
    return isKyberSupported(chainId, version)
  },

  async quote(params: QuoteParams): Promise<AggregatorQuote<KyberRouteSummary> | null> {
    const tokenIn = currencyToAddress(params.tokenIn)
    const tokenOut = currencyToAddress(params.tokenOut)
    if (!tokenIn || !tokenOut) return null
    if (params.amountIn.lte(0)) return null

    const fee = getKyberFeeConfig()
    let res
    try {
      res = await getRoutes({
        chainId: params.chainId,
        tokenIn,
        tokenOut,
        amountIn: params.amountIn.toString(),
        gasInclude: true,
        ...(fee
          ? {
              feeReceiver: fee.feeReceiver,
              feeAmount: fee.feeAmount,
              chargeFeeBy: fee.chargeFeeBy,
              isInBps: fee.isInBps,
            }
          : {}),
      })
    } catch {
      // Network / 4xx / 5xx — treat as "no route" and let orchestration
      // fall back to native + other adapters.
      return null
    }

    const summary: KyberRouteSummary | undefined = res.data?.routeSummary
    const routerAddress = res.data?.routerAddress
    if (!summary || !routerAddress || !summary.amountOut) return null

    const amountOut = BigNumber.from(summary.amountOut)
    if (amountOut.lte(0)) return null

    return {
      aggregatorId: 'kyber',
      amountOut,
      amountOutMin: applySlippage(amountOut, params.slippageBps),
      gasEstimate: summary.gas ? BigNumber.from(summary.gas) : undefined,
      // Kyber returns USD-denominated input/output we could derive a price
      // impact from. Skip for the first cut — the route preview pulls Pyth
      // prices anyway and shows a real impact figure from those.
      priceImpact: undefined,
      routerAddress,
      routeSummary: summary,
      validUntil: Math.floor(Date.now() / 1000) + KYBER_QUOTE_TTL_SECONDS,
    }
  },

  async buildSwap(params: BuildSwapParams<KyberRouteSummary>): Promise<BuildSwapResult> {
    // Fee was already applied at quote time and embedded into
    // routeSummary.extraFee. /route/build only needs the routeSummary +
    // sender/recipient/slippage/deadline.
    const res = await buildRoute({
      chainId: params.chainId,
      routeSummary: params.quote.routeSummary,
      sender: params.account,
      recipient: params.account,
      slippageBps: params.slippageBps,
      deadline: params.deadline,
    })

    if (!res.data?.data || !res.data?.routerAddress) {
      throw new Error(`Kyber build returned no calldata (code=${res.code})`)
    }

    // Native-in swaps must attach msg.value = amountIn. Kyber's route
    // summary stores `tokenIn` as the native sentinel (0xeee…eee) in that
    // case; pull amountIn from the summary so we don't need the original
    // input back at this layer.
    const summary = params.quote.routeSummary
    const isNativeIn = summary.tokenIn?.toLowerCase() === NATIVE_SENTINEL
    const value = isNativeIn && summary.amountIn ? BigNumber.from(summary.amountIn) : undefined

    return {
      to: res.data.routerAddress,
      data: res.data.data,
      value,
      // Kyber's reported gas under-estimates multi-hop routes badly (observed
      // ~1.7× short on a Linea LINEA→ETH swap), and its executor `.call{gas}`s
      // each inner DEX so a too-low limit reverts with the opaque "Call failed".
      // This is the FALLBACK hint only — useAggregatorSwapCallback prefers a
      // live on-chain estimateGas at send time. Use a 100% buffer here so even
      // the fallback path clears realistic routes.
      gasLimit: res.data.gas ? BigNumber.from(res.data.gas).mul(200).div(100) : undefined,
    }
  },
}
