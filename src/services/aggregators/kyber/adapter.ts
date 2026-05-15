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

    let res
    try {
      res = await getRoutes({
        chainId: params.chainId,
        tokenIn,
        tokenOut,
        amountIn: params.amountIn.toString(),
        gasInclude: true,
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

    return {
      to: res.data.routerAddress,
      data: res.data.data,
      // Native-in swaps need msg.value = amountIn. The aggregator emits the
      // gas estimate too — add a 30% buffer (matches the Kyber zap path).
      value: undefined,
      gasLimit: res.data.gas ? BigNumber.from(res.data.gas).mul(130).div(100) : undefined,
    }
  },
}
