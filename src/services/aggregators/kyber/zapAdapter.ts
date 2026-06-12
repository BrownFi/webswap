/**
 * Kyber Zap adapter — implements ZapAggregatorAdapter.
 *
 * Thin wrapper around the existing kyberZapService. No on-chain logic
 * changes here; we just reshape Kyber's responses into the orchestration's
 * normalized {ZapInQuote, ZapOutQuote, BuildZapResult} shape so the
 * comparison hook (Phase 4) can stand it next to native zap.
 *
 * Phase 2 scope: shape only. Wiring into ZapForm / V3ZapForm happens in
 * Phase 5 — current zap callers (zapHelpers) keep using kyberZapService
 * directly until then.
 */
import { Currency, Token } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { kyberZapService } from '../../../services/kyberZapService'
import type {
  BuildZapInParams,
  BuildZapOutParams,
  BuildZapResult,
  ZapAggregatorAdapter,
  ZapInQuote,
  ZapInQuoteParams,
  ZapOutQuote,
  ZapOutQuoteParams,
} from '../zapTypes'
import { isKyberZapSupported } from './chains'

// Kyber zap doesn't ship a quote TTL. Routes hold for ~30–60s in practice;
// mark stale at 30s so orchestration refetches before the user signs rather
// than handing expired calldata to /route/build.
const KYBER_ZAP_QUOTE_TTL_SECONDS = 30

// Pulled from the on-chain response. Kyber returns "addedLiquidity" as the
// post-zap LP token amount; we use it both for `lpOut` and to derive
// `lpOutMin` via slippage (Kyber's calldata already enforces slippage
// internally, but orchestration also surfaces an explicit min to the UI).
type KyberRouteData = Awaited<ReturnType<typeof kyberZapService.getKyberZapInRoute>>

function tokenAddressOf(currency: Currency): string {
  // Kyber zap takes ERC20 addresses; native input on supported chains is
  // wrapped before being passed in (the existing zapHelpers handles that
  // at the form layer). Anything we can't resolve falls back to zero —
  // upstream callers must reject it.
  if (currency instanceof Token) return currency.address
  return AddressZero
}

function applySlippage(amount: BigNumber, slippageBps: number): BigNumber {
  return amount.mul(10_000 - slippageBps).div(10_000)
}

// Kyber's reported gas under-estimates multi-hop routes badly (observed ~1.7×
// short on a Linea swap), and its executor `.call{gas}`s each inner DEX so a
// too-low limit reverts with the opaque "Call failed". This is the FALLBACK
// hint only — the zap send sites prefer a live on-chain estimateGas at send
// time (utils/estimateGasWithMargin). Use a 100% buffer so even the fallback
// path clears realistic routes.
function bufferedGas(raw: string | undefined): BigNumber | undefined {
  if (!raw) return undefined
  try {
    const bn = BigNumber.from(raw)
    return bn.mul(200).div(100)
  } catch {
    return undefined
  }
}

function valueIfNonZero(raw: string | undefined): BigNumber | undefined {
  if (!raw) return undefined
  try {
    const bn = BigNumber.from(raw)
    return bn.isZero() ? undefined : bn
  } catch {
    return undefined
  }
}

export const kyberZapAggregator: ZapAggregatorAdapter<KyberRouteData, KyberRouteData> = {
  id: 'kyber',
  name: 'Kyber',

  isSupported(chainId, version) {
    return isKyberZapSupported(chainId, version)
  },

  async quoteZapIn(params: ZapInQuoteParams): Promise<ZapInQuote<KyberRouteData> | null> {
    if (params.inputs.length === 0) return null

    const tokensIn = params.inputs.map(({ currency }) => tokenAddressOf(currency))
    if (tokensIn.some((addr) => !addr || addr === AddressZero)) return null

    const amountsIn = params.inputs.map(({ amountRaw }) => amountRaw)
    if (amountsIn.some((amt) => !amt || amt === '0')) return null

    let route: KyberRouteData
    try {
      route = await kyberZapService.getKyberZapInRoute({
        chainId: params.chainId,
        poolId: params.pair.liquidityToken.address,
        positionId: params.account,
        tokensIn,
        amountsIn,
        // Kyber expects slippage in basis points as a string.
        slippage: String(params.slippageBps),
        // V3-gen pools (3/4) route to Kyber Earn (dex 84); V2 stays legacy.
        version: params.pair.version,
      })
    } catch {
      return null
    }

    if (!route?.routerAddress) return null
    const lpOutRaw = route.positionDetails?.addedLiquidity
    if (!lpOutRaw) return null
    let lpOut: BigNumber
    try {
      lpOut = BigNumber.from(lpOutRaw)
    } catch {
      return null
    }
    if (lpOut.lte(0)) return null

    return {
      aggregatorId: 'kyber',
      lpOut,
      lpOutMin: applySlippage(lpOut, params.slippageBps),
      priceImpact: typeof route.zapDetails?.priceImpact === 'number' ? route.zapDetails.priceImpact : undefined,
      gasEstimate: route.gas ? BigNumber.from(route.gas) : undefined,
      routerAddress: route.routerAddress,
      routeSummary: route,
      version: params.pair.version,
      validUntil: Math.floor(Date.now() / 1000) + KYBER_ZAP_QUOTE_TTL_SECONDS,
    }
  },

  async quoteZapOut(params: ZapOutQuoteParams): Promise<ZapOutQuote<KyberRouteData> | null> {
    const tokenOutAddr = tokenAddressOf(params.tokenOut)
    if (!tokenOutAddr || tokenOutAddr === AddressZero) return null
    if (!params.liquidityRaw || params.liquidityRaw === '0') return null

    let route: KyberRouteData
    try {
      route = await kyberZapService.getKyberZapOutRoute({
        chainId: params.chainId,
        poolId: params.pair.liquidityToken.address,
        positionId: params.account,
        tokenOut: tokenOutAddr,
        liquidityOut: params.liquidityRaw,
        slippage: String(params.slippageBps),
        version: params.pair.version,
      })
    } catch {
      return null
    }

    if (!route?.routerAddress) return null

    // Kyber's zap-out shape reuses the same KyberZapRouteData struct. The
    // expected output amount is in the final AggregatorSwap/PoolSwap action
    // targeting `tokenOutAddr`, but the cleanest source is `finalAmountUsd`
    // / `initialAmountUsd` together with the LP-side reserves. For Phase 2
    // we expose what the upstream gives us directly; orchestration can show
    // the raw figure and Phase 4 can layer a stricter parse if needed.
    const finalAction = route.zapDetails?.actions?.find((a) => a.type === 'ACTION_TYPE_AGGREGATOR_SWAP' || a.type === 'ACTION_TYPE_POOL_SWAP')
    const lastSwapOut: string | undefined =
      (finalAction as any)?.aggregatorSwap?.swaps?.slice(-1)?.[0]?.tokenOut?.amount ??
      (finalAction as any)?.poolSwap?.swaps?.slice(-1)?.[0]?.tokenOut?.amount

    if (!lastSwapOut) return null
    let amountOut: BigNumber
    try {
      amountOut = BigNumber.from(lastSwapOut)
    } catch {
      return null
    }
    if (amountOut.lte(0)) return null

    return {
      aggregatorId: 'kyber',
      amountOut,
      amountOutMin: applySlippage(amountOut, params.slippageBps),
      priceImpact: typeof route.zapDetails?.priceImpact === 'number' ? route.zapDetails.priceImpact : undefined,
      gasEstimate: route.gas ? BigNumber.from(route.gas) : undefined,
      routerAddress: route.routerAddress,
      routeSummary: route,
      version: params.pair.version,
      validUntil: Math.floor(Date.now() / 1000) + KYBER_ZAP_QUOTE_TTL_SECONDS,
    }
  },

  async buildZapIn(params: BuildZapInParams<KyberRouteData>): Promise<BuildZapResult> {
    const built = await kyberZapService.buildKyberZapInRoute({
      chainId: params.chainId,
      sender: params.account,
      recipient: params.account,
      route: params.quote.routeSummary.route,
      // Pass through the user's deadline so it's embedded in the calldata
      // rather than letting Kyber substitute its own implicit default.
      deadline: params.deadline,
      version: params.quote.version,
    })

    if (!built?.callData || !built?.routerAddress) {
      throw new Error('Kyber zap-in build returned no calldata')
    }

    return {
      to: built.routerAddress,
      data: built.callData,
      value: valueIfNonZero(built.value),
      gasLimit: bufferedGas(params.quote.routeSummary.gas),
    }
  },

  async buildZapOut(params: BuildZapOutParams<KyberRouteData>): Promise<BuildZapResult> {
    const built = await kyberZapService.buildKyberZapOutRoute({
      chainId: params.chainId,
      sender: params.account,
      recipient: params.account,
      route: params.quote.routeSummary.route,
      deadline: params.deadline,
      version: params.quote.version,
    })

    if (!built?.callData || !built?.routerAddress) {
      throw new Error('Kyber zap-out build returned no calldata')
    }

    return {
      to: built.routerAddress,
      data: built.callData,
      value: valueIfNonZero(built.value),
      gasLimit: bufferedGas(params.quote.routeSummary.gas),
    }
  },
}

/** Standalone helper for callers (mainly the build params type) that need
 *  the raw Kyber route shape without importing the service directly. */
export type { KyberRouteData }
