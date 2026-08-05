// Oracle in-range liquidity math — a faithful port of v3-core's
// scripts/check-v3-thresholds.ts (directMetrics / pathMetrics / inRangeLiquidity*).
// Computes the "actual" oracle liquidity (WAD-scaled, in quote for a direct pool or
// base for a two-hop path) that the OracleGateway validates against its thresholds
// (minLiquidityInQuote / minPathLiquidityInBase). All bigint, no precision loss.

const Q96 = 1n << 96n
const Q128 = 1n << 128n
const MAX_UINT160 = (1n << 160n) - 1n
const MAX_UINT256 = (1n << 256n) - 1n

const TICK_MULTIPLIERS: readonly bigint[] = [
  0xfffcb933bd6fad37aa2d162d1a594001n, 0xfff97272373d413259a46990580e213an, 0xfff2e50f5f656932ef12357cf3c7fdccn,
  0xffe5caca7e10e4e61c3624eaa0941cd0n, 0xffcb9843d60f6159c9db58835c926644n, 0xff973b41fa98c081472e6896dfb254c0n,
  0xff2ea16466c96a3843ec78b326b52861n, 0xfe5dee046a99a2a811c461f1969c3053n, 0xfcbe86c7900a88aedcffc83b479aa3a4n,
  0xf987a7253ac413176f2b074cf7815e54n, 0xf3392b0822b70005940c7a398e4b70f3n, 0xe7159475a2c29b7443b29c7fa6e889d9n,
  0xd097f3bdfd2022b8845ad8f792aa5825n, 0xa9f746462d870fdf8a65dc1f90e061e5n, 0x70d869a156d2a1b890bb3df62baf32f7n,
  0x31be135f97d08fd981231505542fcfa6n, 0x9aa508b5b7a84e1c677de54f3e99bc9n, 0x5d6af8dedb81196699c329225ee604n,
  0x2216e584f5fa1ea926041bedfe98n, 0x48a170391f7dc42444e8fa2n,
]

const mulDiv = (a: bigint, b: bigint, d: bigint) => (a * b) / d
const pow10 = (e: number) => {
  let v = 1n
  for (let i = 0; i < e; i++) v *= 10n
  return v
}
const normalizeToWei = (v: bigint, d: number) => (d < 18 ? v * pow10(18 - d) : d > 18 ? v / pow10(d - 18) : v)
const decimalAdjustPrice = (px: bigint, d0: number, d1: number) =>
  d0 > d1 ? px * pow10(d0 - d1) : d1 > d0 ? px / pow10(d1 - d0) : px
const floorDivSigned = (n: bigint, d: bigint) => {
  let q = n / d
  if (n < 0n && n % d !== 0n) q -= 1n
  return q
}

export interface PoolMetaDecimals {
  decimals0: number
  decimals1: number
}

export const adjustedPoolPriceX96 = (sqrtPriceX96: bigint, m: PoolMetaDecimals) =>
  decimalAdjustPrice(mulDiv(sqrtPriceX96, sqrtPriceX96, Q96), m.decimals0, m.decimals1)

const quotePerBasePriceX96 = (adjustedPriceX96: bigint, quoteTokenIndex: number) =>
  adjustedPriceX96 === 0n ? 0n : quoteTokenIndex === 0 ? mulDiv(Q96, Q96, adjustedPriceX96) : adjustedPriceX96

function inRangeLiquidityInQuote(
  m: PoolMetaDecimals,
  quoteTokenIndex: number,
  sqrtPriceX96: bigint,
  adjustedPriceX96: bigint,
  activeLiquidity: bigint,
): bigint {
  if (activeLiquidity === 0n || sqrtPriceX96 === 0n) return 0n
  const va0 = mulDiv(activeLiquidity, Q96, sqrtPriceX96)
  const va1 = mulDiv(activeLiquidity, sqrtPriceX96, Q96)
  const nb0 = normalizeToWei(va0, m.decimals0)
  const nb1 = normalizeToWei(va1, m.decimals1)
  const q = quotePerBasePriceX96(adjustedPriceX96, quoteTokenIndex)
  return quoteTokenIndex === 0 ? nb0 + mulDiv(nb1, q, Q96) : mulDiv(nb0, q, Q96) + nb1
}

function inRangeLiquidityInBase(
  m: PoolMetaDecimals,
  quoteTokenIndex: number,
  sqrtPriceX96: bigint,
  adjustedPriceX96: bigint,
  activeLiquidity: bigint,
  intermediateTokenPriceX96: bigint,
): bigint {
  if (activeLiquidity === 0n || sqrtPriceX96 === 0n) return 0n
  const va0 = mulDiv(activeLiquidity, Q96, sqrtPriceX96)
  const va1 = mulDiv(activeLiquidity, sqrtPriceX96, Q96)
  const nb0 = normalizeToWei(va0, m.decimals0)
  const nb1 = normalizeToWei(va1, m.decimals1)
  if (quoteTokenIndex === 0) {
    const basePerQuoteX96 = mulDiv(adjustedPriceX96, Q96, intermediateTokenPriceX96)
    return mulDiv(nb0, basePerQuoteX96, Q96) + mulDiv(nb1, Q96, intermediateTokenPriceX96)
  }
  const priceProductX96 = mulDiv(intermediateTokenPriceX96, adjustedPriceX96, Q96)
  const basePerQuoteX96 = mulDiv(Q96, Q96, priceProductX96)
  return mulDiv(nb0, Q96, intermediateTokenPriceX96) + mulDiv(nb1, basePerQuoteX96, Q96)
}

function getSqrtRatioAtTick(tick: number): bigint {
  const absTick = tick < 0 ? -tick : tick
  if (absTick > 887272) throw new Error(`Tick out of range: ${tick}`)
  let ratio = (absTick & 1) !== 0 ? TICK_MULTIPLIERS[0] : Q128
  for (let bit = 1; bit < TICK_MULTIPLIERS.length; bit++) {
    if ((absTick & (1 << bit)) !== 0) ratio = (ratio * TICK_MULTIPLIERS[bit]) >> 128n
  }
  if (tick > 0) ratio = MAX_UINT256 / ratio
  const shifted = ratio >> 32n
  return shifted + ((ratio & ((1n << 32n) - 1n)) === 0n ? 0n : 1n)
}

const harmonicMeanLiquidity = (twalWindow: number, deltaSecondsPerLiquidityX128: bigint) =>
  deltaSecondsPerLiquidityX128 === 0n ? 0n : (BigInt(twalWindow) * MAX_UINT160) / (deltaSecondsPerLiquidityX128 << 32n)

export interface PoolPriceLiquidityInput {
  meta: PoolMetaDecimals
  spotSqrtPriceX96: bigint
  spotLiquidity: bigint
  window: number // oracle.twapWindow(pair, pool)
  twalWindowMultiplier: number
  twalWindowMax: number
  // observe([window, twalWindow, 0]) results — required when window > 0.
  tickCumulatives?: readonly [bigint, bigint, bigint]
  secondsPerLiquidityX128?: readonly [bigint, bigint, bigint]
}

export interface PoolPriceLiquidity {
  meta: PoolMetaDecimals
  priceSqrtPriceX96: bigint
  spotSqrtPriceX96: bigint
  spotLiquidity: bigint
  twalLiquidity: bigint
}

/** Resolves spot + TWAL price/liquidity for a pool (mirrors readPriceAndLiquidity). */
export function poolPriceLiquidity(i: PoolPriceLiquidityInput): PoolPriceLiquidity {
  if (i.window === 0 || !i.tickCumulatives || !i.secondsPerLiquidityX128) {
    return {
      meta: i.meta,
      priceSqrtPriceX96: i.spotSqrtPriceX96,
      spotSqrtPriceX96: i.spotSqrtPriceX96,
      spotLiquidity: i.spotLiquidity,
      twalLiquidity: i.spotLiquidity,
    }
  }
  const twalWindow = Math.min(i.window * i.twalWindowMultiplier, i.twalWindowMax)
  const tc = i.tickCumulatives
  const spl = i.secondsPerLiquidityX128
  const tickDelta = tc[2] - tc[0]
  const avgTick = Number(floorDivSigned(tickDelta, BigInt(i.window)))
  const now = spl[2]
  const past = spl[1]
  const deltaSecondsPerLiquidity = now >= past ? now - past : (1n << 160n) + now - past
  return {
    meta: i.meta,
    priceSqrtPriceX96: getSqrtRatioAtTick(avgTick),
    spotSqrtPriceX96: i.spotSqrtPriceX96,
    spotLiquidity: i.spotLiquidity,
    twalLiquidity: harmonicMeanLiquidity(twalWindow, deltaSecondsPerLiquidity),
  }
}

/** Direct-pool actual liquidity in QUOTE units (WAD) = min(spot, twal). */
export function directActualQuote(pl: PoolPriceLiquidity, poolQuoteTokenIndex: number): bigint {
  const spot = inRangeLiquidityInQuote(
    pl.meta,
    poolQuoteTokenIndex,
    pl.spotSqrtPriceX96,
    adjustedPoolPriceX96(pl.spotSqrtPriceX96, pl.meta),
    pl.spotLiquidity,
  )
  const twal = inRangeLiquidityInQuote(
    pl.meta,
    poolQuoteTokenIndex,
    pl.priceSqrtPriceX96,
    adjustedPoolPriceX96(pl.priceSqrtPriceX96, pl.meta),
    pl.twalLiquidity,
  )
  return spot < twal ? spot : twal
}

/** Two-hop path actual liquidity in BASE units (WAD) = min(leg1Base, leg2Base). */
export function pathActualBase(
  pl1: PoolPriceLiquidity,
  qti1: number,
  pl2: PoolPriceLiquidity,
  qti2: number,
): bigint {
  const adjusted1 = adjustedPoolPriceX96(pl1.priceSqrtPriceX96, pl1.meta)
  const adjustedSpot1 = adjustedPoolPriceX96(pl1.spotSqrtPriceX96, pl1.meta)
  const price1X96 = quotePerBasePriceX96(adjusted1, qti1)
  const spotPrice1X96 = quotePerBasePriceX96(adjustedSpot1, qti1)

  const leg1SpotInIntermediate = inRangeLiquidityInQuote(pl1.meta, qti1, pl1.spotSqrtPriceX96, adjustedSpot1, pl1.spotLiquidity)
  const leg1TwalInIntermediate = inRangeLiquidityInQuote(pl1.meta, qti1, pl1.priceSqrtPriceX96, adjusted1, pl1.twalLiquidity)
  const leg1SpotInBase = spotPrice1X96 === 0n ? 0n : mulDiv(leg1SpotInIntermediate, Q96, spotPrice1X96)
  const leg1TwalInBase = price1X96 === 0n ? 0n : mulDiv(leg1TwalInIntermediate, Q96, price1X96)
  const leg1Base = leg1SpotInBase < leg1TwalInBase ? leg1SpotInBase : leg1TwalInBase

  const adjusted2 = adjustedPoolPriceX96(pl2.priceSqrtPriceX96, pl2.meta)
  const adjustedSpot2 = adjustedPoolPriceX96(pl2.spotSqrtPriceX96, pl2.meta)
  const leg2SpotInBase = inRangeLiquidityInBase(pl2.meta, qti2, pl2.spotSqrtPriceX96, adjustedSpot2, pl2.spotLiquidity, spotPrice1X96)
  const leg2TwalInBase = inRangeLiquidityInBase(pl2.meta, qti2, pl2.priceSqrtPriceX96, adjusted2, pl2.twalLiquidity, price1X96)
  const leg2Base = leg2SpotInBase < leg2TwalInBase ? leg2SpotInBase : leg2TwalInBase

  return leg1Base < leg2Base ? leg1Base : leg2Base
}
