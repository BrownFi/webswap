/**
 * Native (BrownFi router) zap adapter — implements ZapAggregatorAdapter.
 *
 * Phase 3 scope: V3 only. The BrownFi V3 router exposes zapIn/zapInETH/
 * zapOut/zapOutETH; this adapter wraps them via `v3Zap.ts` helpers and
 * normalizes the result into the orchestration's shape so Phase 4 can stand
 * it next to the Kyber zap adapter for a head-to-head comparison.
 *
 * V2 is intentionally unsupported: the BrownFi V2 router has no native zap
 * function today, so V2 stays Kyber-only until contracts ship one. The
 * `isSupported` gate returns false on V2 chains so the registry skips it
 * (the version check is what gates this — not the chain).
 *
 * No on-chain logic moves here; the adapter calls the same primitives the
 * existing V3ZapForm uses (`getV3ZapEstimate`, `buildV3UpdateData`, the
 * new `buildV3ZapIn/OutTx`). Existing UI keeps working unchanged until
 * Phase 5 migrates it.
 */
import { Currency, Token, ETHER, WETH } from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { createPublicClient, http } from 'viem'
import {
  buildV3UpdateData,
  buildV3ZapInTx,
  buildV3ZapOutTx,
  getV3ZapEstimate,
  isV3ZapSupported,
} from 'utils/v3Zap'
import { RPC_URLS } from 'lib/sdk/constants/addresses'
import { getRouterAddress } from 'lib/sdk/utils'
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

// ERC20 totalSupply only — we don't need decimals or symbol here, those come
// from the Pair the caller already has.
const ERC20_TOTAL_SUPPLY_ABI = [
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const TWO = BigNumber.from(2)

// Native adapter has no upstream quote TTL; the only thing that goes stale
// is the Pyth price encoded into updateData. Build-time fetches fresh data
// so a 30s TTL on the quote is fine (matches the Kyber zap adapter).
const NATIVE_ZAP_QUOTE_TTL_SECONDS = 30

/**
 * Resolve a Currency (ETHER sentinel or Token) to the on-chain address the
 * V3 zap functions expect. Returns the wrapped address for native (so the
 * adapter can hand it to non-ETH callsites) and the boolean separately.
 */
function resolveZapToken(
  currency: Currency,
  chainId: number,
): { address: string; isNative: boolean } | null {
  if (currency === ETHER) {
    const w = WETH[chainId]
    if (!w) return null
    return { address: w.address, isNative: true }
  }
  if (currency instanceof Token) {
    return { address: currency.address, isNative: false }
  }
  return null
}

/**
 * Returns the *other* token's address given the input. Both must be in the
 * pool; otherwise returns null and the adapter rejects the quote (V3 native
 * zap only handles single-side deposits from one of the two pool tokens).
 */
function pickOtherTokenAddress(pool: ZapInQuoteParams['pair'], inputAddress: string): string | null {
  const a = pool.token0.address.toLowerCase()
  const b = pool.token1.address.toLowerCase()
  const i = inputAddress.toLowerCase()
  if (i === a) return pool.token1.address
  if (i === b) return pool.token0.address
  return null
}

/**
 * Lightweight LP-out estimate. We can't run the contract's `zapIn` static
 * call without the user's tokens + approval already in place, so this uses
 * the V2-style minted-LP formula on current reserves + totalSupply:
 *
 *   liquidity = min(amountA * totalSupply / reserveA,
 *                   amountB * totalSupply / reserveB)
 *
 * `amountA` is the input remaining after the internal half-swap; `amountB`
 * is what the swap quote says we'll receive. Reserves are slightly stale
 * here (pre-swap), so the figure underestimates LP by a tiny margin — fine
 * for a comparison metric vs Kyber's reported `addedLiquidity`.
 */
async function estimateLpOut({
  chainId,
  pairAddress,
  reserveTokenIn,
  reserveTokenOther,
  amountAfterSwap,
  amountOther,
}: {
  chainId: number
  pairAddress: string
  reserveTokenIn: BigNumber
  reserveTokenOther: BigNumber
  amountAfterSwap: BigNumber
  amountOther: BigNumber
}): Promise<BigNumber> {
  const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
  const totalSupplyRaw = await client.readContract({
    address: pairAddress as `0x${string}`,
    abi: ERC20_TOTAL_SUPPLY_ABI,
    functionName: 'totalSupply',
  })
  const totalSupply = BigNumber.from(totalSupplyRaw.toString())
  if (totalSupply.isZero() || reserveTokenIn.isZero() || reserveTokenOther.isZero()) {
    return BigNumber.from(0)
  }

  const lpFromIn = amountAfterSwap.mul(totalSupply).div(reserveTokenIn)
  const lpFromOther = amountOther.mul(totalSupply).div(reserveTokenOther)
  return lpFromIn.lt(lpFromOther) ? lpFromIn : lpFromOther
}

function applySlippage(amount: BigNumber, slippageBps: number): BigNumber {
  return amount.mul(10_000 - slippageBps).div(10_000)
}

export const nativeZapAggregator: ZapAggregatorAdapter<NativeZapInRoute, NativeZapOutRoute> = {
  id: 'native',
  name: 'BrownFi',

  isSupported(chainId, version) {
    return version === 3 && isV3ZapSupported(chainId, version)
  },

  async quoteZapIn(params: ZapInQuoteParams): Promise<ZapInQuote<NativeZapInRoute> | null> {
    // V3 native zap deposits one of the two pool tokens. Multi-token zap is
    // a Kyber-only feature — if the caller passes more than one input, the
    // native adapter declines so orchestration falls back on Kyber.
    if (params.inputs.length !== 1) return null
    const [{ currency, amountRaw }] = params.inputs
    if (!amountRaw || amountRaw === '0') return null

    const resolved = resolveZapToken(currency, params.chainId)
    if (!resolved) return null

    // wrappedTokenIn is what gets passed to the contract (either Token
    // address or the WETH address when input is native ETH). The native
    // sentinel never reaches the contract — zapInETH is selected instead.
    const tokenInAddress = resolved.address
    const tokenOtherAddress = pickOtherTokenAddress(params.pair, tokenInAddress)
    if (!tokenOtherAddress) return null

    let amountOut: bigint
    let amountOtherMin: bigint
    try {
      const est = await getV3ZapEstimate(
        params.chainId,
        tokenInAddress,
        tokenOtherAddress,
        amountRaw,
        params.slippageBps,
      )
      amountOut = est.amountOut
      amountOtherMin = est.amountOtherMin
    } catch {
      return null
    }

    // Pyth updateData fetched at quote time so the adapter can hand the
    // exact same blob into buildZapIn without a second roundtrip. If feeds
    // aren't registered, buildV3UpdateData throws V3_FEED_NOT_REGISTERED;
    // we treat that as "no native quote" and let Kyber win.
    let updateData: string
    try {
      updateData = await buildV3UpdateData([tokenInAddress, tokenOtherAddress], params.chainId)
    } catch {
      return null
    }

    const amountAfterSwap = BigNumber.from(amountRaw).sub(BigNumber.from(amountRaw).div(TWO))

    // Reserves are read off the Pair (already populated by useAllCommonPairs
    // / Reserves.ts upstream). Pick the side matching tokenIn vs tokenOther.
    const reserveIn = params.pair.reserveOf(
      tokenInAddress.toLowerCase() === params.pair.token0.address.toLowerCase()
        ? params.pair.token0
        : params.pair.token1,
    )
    const reserveOther = params.pair.reserveOf(
      tokenOtherAddress.toLowerCase() === params.pair.token0.address.toLowerCase()
        ? params.pair.token0
        : params.pair.token1,
    )

    const lpOut = await estimateLpOut({
      chainId: params.chainId,
      pairAddress: params.pair.liquidityToken.address,
      reserveTokenIn: BigNumber.from(reserveIn.raw.toString()),
      reserveTokenOther: BigNumber.from(reserveOther.raw.toString()),
      amountAfterSwap,
      amountOther: BigNumber.from(amountOut.toString()),
    }).catch(() => BigNumber.from(0))

    const routerAddress = getRouterAddress(params.chainId, 3)
    if (!routerAddress) return null

    return {
      aggregatorId: 'native',
      lpOut,
      lpOutMin: applySlippage(lpOut, params.slippageBps),
      // V3 zap math sits inside the contract; price impact isn't returned
      // by getV3ZapEstimate. Leave undefined; orchestration can pull it
      // from Pyth-vs-pool drift elsewhere if needed.
      priceImpact: undefined,
      // No gas estimate without simulateContract; let wallet estimate at sign.
      gasEstimate: undefined,
      routerAddress,
      routeSummary: {
        tokenInAddress,
        tokenOtherAddress,
        amountIn: amountRaw,
        amountOtherMin: amountOtherMin.toString(),
        updateData,
        isNativeETH: resolved.isNative,
      },
      validUntil: Math.floor(Date.now() / 1000) + NATIVE_ZAP_QUOTE_TTL_SECONDS,
    }
  },

  async quoteZapOut(params: ZapOutQuoteParams): Promise<ZapOutQuote<NativeZapOutRoute> | null> {
    if (!params.liquidityRaw || params.liquidityRaw === '0') return null

    const resolved = resolveZapToken(params.tokenOut, params.chainId)
    if (!resolved) return null

    const tokenOutAddress = resolved.address
    const tokenAAddress = params.pair.token0.address
    const tokenBAddress = params.pair.token1.address

    // tokenOut must be one of the pool tokens for V3 zap-out. Multi-hop
    // single-sided exit is a Kyber-only feature.
    if (
      tokenOutAddress.toLowerCase() !== tokenAAddress.toLowerCase() &&
      tokenOutAddress.toLowerCase() !== tokenBAddress.toLowerCase()
    ) {
      return null
    }

    // Off-chain quote: LP burn returns proportional reserves, then the
    // non-chosen side gets swapped to tokenOut via the V3 swap quote. Sums
    // to total amountOut. Slippage applied by caller via amountOutMin.
    let totalSupply: BigNumber
    let updateData: string
    try {
      const client = createPublicClient({ transport: http(RPC_URLS[params.chainId]) })
      const totalSupplyRaw = await client.readContract({
        address: params.pair.liquidityToken.address as `0x${string}`,
        abi: ERC20_TOTAL_SUPPLY_ABI,
        functionName: 'totalSupply',
      })
      totalSupply = BigNumber.from(totalSupplyRaw.toString())
      updateData = await buildV3UpdateData([tokenAAddress, tokenBAddress], params.chainId)
    } catch {
      return null
    }
    if (totalSupply.isZero()) return null

    const liquidity = BigNumber.from(params.liquidityRaw)
    const reserve0 = BigNumber.from(params.pair.reserve0.raw.toString())
    const reserve1 = BigNumber.from(params.pair.reserve1.raw.toString())
    const shareToken0 = liquidity.mul(reserve0).div(totalSupply)
    const shareToken1 = liquidity.mul(reserve1).div(totalSupply)

    const outIsToken0 = tokenOutAddress.toLowerCase() === tokenAAddress.toLowerCase()
    const directOut = outIsToken0 ? shareToken0 : shareToken1
    const otherSide = outIsToken0 ? shareToken1 : shareToken0
    const otherToken = outIsToken0 ? tokenBAddress : tokenAAddress

    // Swap the other side into tokenOut to project the total amountOut.
    let swapAmountOut: BigNumber = BigNumber.from(0)
    try {
      const est = await getV3ZapEstimate(
        params.chainId,
        otherToken,
        tokenOutAddress,
        otherSide.mul(2).toString(), // getV3ZapEstimate halves internally; pass 2x to model a full swap
        0,
      )
      swapAmountOut = BigNumber.from(est.amountOut.toString())
    } catch {
      // If the quote leg fails we still return directOut alone — caller
      // sees a conservative figure rather than no native quote at all.
    }

    const amountOut = directOut.add(swapAmountOut)
    if (amountOut.lte(0)) return null

    const routerAddress = getRouterAddress(params.chainId, 3)
    if (!routerAddress) return null

    return {
      aggregatorId: 'native',
      amountOut,
      amountOutMin: applySlippage(amountOut, params.slippageBps),
      priceImpact: undefined,
      gasEstimate: undefined,
      routerAddress,
      routeSummary: {
        tokenAAddress,
        tokenBAddress,
        tokenOutAddress,
        liquidityRaw: params.liquidityRaw,
        updateData,
        isNativeETH: resolved.isNative,
      },
      validUntil: Math.floor(Date.now() / 1000) + NATIVE_ZAP_QUOTE_TTL_SECONDS,
    }
  },

  async buildZapIn(params: BuildZapInParams<NativeZapInRoute>): Promise<BuildZapResult> {
    const r = params.quote.routeSummary
    const deadlineBn = BigNumber.from(params.deadline)
    return buildV3ZapInTx({
      chainId: params.chainId,
      tokenIn: r.tokenInAddress,
      tokenOther: r.tokenOtherAddress,
      amountIn: r.amountIn,
      amountOtherMin: r.amountOtherMin,
      // minLiquidity uses lpOutMin from the quote so the contract enforces
      // user-visible slippage, not the contract's own minimum.
      minLiquidity: params.quote.lpOutMin.toString(),
      account: params.account,
      deadline: deadlineBn,
      updateData: r.updateData,
      isNativeETH: r.isNativeETH,
    })
  },

  async buildZapOut(params: BuildZapOutParams<NativeZapOutRoute>): Promise<BuildZapResult> {
    const r = params.quote.routeSummary
    const deadlineBn = BigNumber.from(params.deadline)
    return buildV3ZapOutTx({
      chainId: params.chainId,
      tokenA: r.tokenAAddress,
      tokenB: r.tokenBAddress,
      tokenOut: r.tokenOutAddress,
      liquidity: r.liquidityRaw,
      amountMin: params.quote.amountOutMin.toString(),
      account: params.account,
      deadline: deadlineBn,
      updateData: r.updateData,
      isNativeETH: r.isNativeETH,
    })
  },
}

/** Raw shape the adapter stores in routeSummary for zap-in. Internal — the
 *  comparison hook and execution layer pass it through opaquely. */
export type NativeZapInRoute = {
  tokenInAddress: string
  tokenOtherAddress: string
  amountIn: string
  amountOtherMin: string
  updateData: string
  isNativeETH: boolean
}

/** Raw shape for zap-out. */
export type NativeZapOutRoute = {
  tokenAAddress: string
  tokenBAddress: string
  tokenOutAddress: string
  liquidityRaw: string
  updateData: string
  isNativeETH: boolean
}
