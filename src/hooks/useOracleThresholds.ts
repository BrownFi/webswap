import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { createReadClient } from 'lib/sdk/rpc'
import { ORACLE_GATEWAY_ADDRESS } from 'lib/sdk/constants/addresses'
import {
  directActualQuote,
  pathActualBase,
  poolPriceLiquidity,
  type PoolMetaDecimals,
} from 'lib/sdk/oracleLiquidity'

const ORACLE_ABI = [
  { type: 'function', name: 'minLiquidityInQuote', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'minPathLiquidityInBase', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'v3Pools', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'address' }] },
  {
    type: 'function',
    name: 'v3PoolPaths',
    stateMutability: 'view',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [{ type: 'address' }, { type: 'uint8' }, { type: 'address' }, { type: 'uint8' }],
  },
  { type: 'function', name: 'twapWindow', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'address' }], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'quoteTokenIndex', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'address' }], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'TWAL_WINDOW_MULTIPLIER', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
  { type: 'function', name: 'TWAL_WINDOW_MAX', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint32' }] },
] as const

const POOL_ABI = [
  { type: 'function', name: 'token0', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'token1', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'liquidity', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint128' }] },
  {
    type: 'function',
    name: 'slot0',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint160' }, { type: 'int24' }, { type: 'uint16' }, { type: 'uint16' }, { type: 'uint16' }, { type: 'uint8' }, { type: 'bool' }],
  },
  { type: 'function', name: 'observe', stateMutability: 'view', inputs: [{ type: 'uint32[]' }], outputs: [{ type: 'int56[]' }, { type: 'uint160[]' }] },
] as const

const V4_ADAPTER_ABI = [
  { type: 'function', name: 'poolManager', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'poolId', stateMutability: 'view', inputs: [], outputs: [{ type: 'bytes32' }] },
  { type: 'function', name: 'hooks', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const

const ERC20_ABI = [{ type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }] as const

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const
const ZERO = '0x0000000000000000000000000000000000000000'
// OracleGateway exposes indexed entries without an array-length getter. Probe a
// generous contiguous range so pairs with more than the current 2-4 entries are
// still rendered in full; zero-address slots are discarded below.
const MAX_DIRECT_POOLS = 8
const MAX_POOL_PATHS = 8

export interface OracleDirectPoolThreshold {
  address: string
  actual: number | null
  twapWindow: number
  kind: 'v3' | 'v4-adapter' | 'unknown'
}

export interface OracleThresholds {
  /** Direct-pool: min threshold + actual, both in QUOTE-token units (WAD applied). */
  minTvlDirect: number | null
  actualDirect: number | null
  directPools: OracleDirectPoolThreshold[]
  /** Two-hop path: min threshold + actual, both in BASE-token units. */
  minTvlPath: number | null
  actualPath: number | null
  actualPaths: (number | null)[]
  twapWindows: number[]
}

export function useOracleThresholds(chainId: number | undefined, pairAddress: string | undefined, enabled = true) {
  return useQuery<OracleThresholds | null>({
    queryKey: ['oracleThresholds', chainId, pairAddress?.toLowerCase()],
    enabled: enabled && !!chainId && !!pairAddress && !!ORACLE_GATEWAY_ADDRESS[chainId as number],
    staleTime: 5 * 60_000, // actual liquidity drifts with price; refresh occasionally (thresholds are static)
    gcTime: 30 * 60_000,
    queryFn: () => fetchOracleThresholds(chainId as number, pairAddress as string),
  })
}

type Addr = `0x${string}`

async function fetchOracleThresholds(chainId: number, pairAddress: string): Promise<OracleThresholds | null> {
  const oracleAddr = ORACLE_GATEWAY_ADDRESS[chainId]
  if (!oracleAddr) return null
  const client = createReadClient(chainId)
  const pair = pairAddress as Addr
  const o = oracleAddr as Addr

  // ── Stage 1: thresholds, oracle pool/path addresses, TWAL window params ──
  const s1 = await client.multicall({
    multicallAddress: MULTICALL3,
    allowFailure: true,
    contracts: [
      { address: o, abi: ORACLE_ABI, functionName: 'minLiquidityInQuote', args: [pair] },
      { address: o, abi: ORACLE_ABI, functionName: 'minPathLiquidityInBase', args: [pair] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 0n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 1n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 2n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 3n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 4n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 5n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 6n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 7n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 0n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 1n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 2n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 3n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 4n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 5n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 6n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 7n] },
      { address: o, abi: ORACLE_ABI, functionName: 'TWAL_WINDOW_MULTIPLIER' },
      { address: o, abi: ORACLE_ABI, functionName: 'TWAL_WINDOW_MAX' },
    ],
  })
  const ok = <T,>(i: number): T | undefined => (s1[i]?.status === 'success' ? (s1[i].result as T) : undefined)
  const minQ = ok<bigint>(0)
  const minPB = ok<bigint>(1)
  const directPools = Array.from({ length: MAX_DIRECT_POOLS }, (_, index) => ok<string>(2 + index))
    .filter((address): address is string => !!address && address.toLowerCase() !== ZERO)
  const pathOffset = 2 + MAX_DIRECT_POOLS
  const paths = Array.from({ length: MAX_POOL_PATHS }, (_, index) => ok<readonly [string, number, string, number]>(pathOffset + index))
    .filter((path): path is readonly [string, number, string, number] => !!path && path[0].toLowerCase() !== ZERO)
  const twalOffset = pathOffset + MAX_POOL_PATHS
  const twalMult = Number(ok<number | bigint>(twalOffset) ?? 0)
  const twalMax = Number(ok<number | bigint>(twalOffset + 1) ?? 0)

  const isDirect = directPools.length > 0
  const directLegs = directPools.map((pool) => ({ pool: pool as Addr, qti: -1 }))
  const pathLegGroups = paths
    .map((path) => [
      { pool: path[0] as Addr, qti: Number(path[1]) },
      ...(path[2].toLowerCase() !== ZERO ? [{ pool: path[2] as Addr, qti: Number(path[3]) }] : []),
    ])
    .filter((group): group is [{ pool: Addr; qti: number }, { pool: Addr; qti: number }] => group.length === 2)
  const legs = [...directLegs, ...pathLegGroups.flat()]
  const directLegCount = directLegs.length

  const toNum = (v: bigint | undefined) => (v && v > 0n ? Number(formatUnits(v, 18)) : null)
  if (!legs.length) {
    return { minTvlDirect: toNum(minQ), actualDirect: null, directPools: [], minTvlPath: toNum(minPB), actualPath: null, actualPaths: [], twapWindows: [] }
  }

  // ── Stage 2: per-pool metadata + V3 state + V4 adapter probe ──
  const perPool = 9
  const s2 = await client.multicall({
    multicallAddress: MULTICALL3,
    allowFailure: true,
    contracts: legs.flatMap((l) => [
      { address: o, abi: ORACLE_ABI, functionName: 'twapWindow' as const, args: [pair, l.pool] },
      { address: o, abi: ORACLE_ABI, functionName: 'quoteTokenIndex' as const, args: [pair, l.pool] },
      { address: l.pool, abi: POOL_ABI, functionName: 'token0' as const },
      { address: l.pool, abi: POOL_ABI, functionName: 'token1' as const },
      { address: l.pool, abi: POOL_ABI, functionName: 'slot0' as const },
      { address: l.pool, abi: POOL_ABI, functionName: 'liquidity' as const },
      // Original V3 pools do not expose these getters. The three successful
      // calls identify BrownFi's UniswapV4ToV3Adapter.
      { address: l.pool, abi: V4_ADAPTER_ABI, functionName: 'poolManager' as const },
      { address: l.pool, abi: V4_ADAPTER_ABI, functionName: 'poolId' as const },
      { address: l.pool, abi: V4_ADAPTER_ABI, functionName: 'hooks' as const },
    ]),
  })
  const g2 = <T,>(li: number, off: number): T | undefined => {
    const r = s2[li * perPool + off]
    return r?.status === 'success' ? (r.result as T) : undefined
  }

  type Leg = {
    pool: Addr
    qti: number
    window: number
    token0: Addr
    token1: Addr
    slot0Sqrt: bigint
    liquidity: bigint
    kind: 'v3' | 'v4-adapter'
  }
  const resolved: (Leg | null)[] = legs.map((l, li) => {
    const window = Number(g2<number | bigint>(li, 0) ?? 0)
    // Direct pools use the gateway's per-pool mapping; path legs must use the
    // quote-token index stored on the path itself. A pool can have different
    // semantics in a path than in the direct-pool mapping.
    const poolQti = l.qti >= 0 ? l.qti : Number(g2<number | bigint>(li, 1) ?? 0)
    const token0 = g2<string>(li, 2)
    const token1 = g2<string>(li, 3)
    const slot0 = g2<readonly unknown[]>(li, 4)
    const liquidity = g2<bigint>(li, 5)
    const hasV4AdapterGetters =
      g2<string>(li, 6) !== undefined &&
      g2<string>(li, 7) !== undefined &&
      g2<string>(li, 8) !== undefined
    if (!token0 || !token1 || !slot0 || liquidity === undefined) return null
    return {
      pool: l.pool,
      qti: poolQti,
      window,
      token0: token0 as Addr,
      token1: token1 as Addr,
      slot0Sqrt: BigInt(slot0[0] as bigint),
      liquidity,
      kind: hasV4AdapterGetters ? 'v4-adapter' : 'v3',
    }
  })

  const twapWindows = Array.from(new Set(resolved.filter((r): r is Leg => !!r).map((r) => r.window).filter((n) => n > 0)))

  // ── Stage 3: token decimals + observe (only where window > 0) ──
  const tokenSet = Array.from(new Set(resolved.filter((r): r is Leg => !!r).flatMap((r) => [r.token0, r.token1])))
  const decCalls = tokenSet.map((t) => ({ address: t, abi: ERC20_ABI, functionName: 'decimals' as const }))
  const observeLegs = resolved
    .map((r, li) => ({ r, li }))
    .filter((x): x is { r: Leg; li: number } => !!x.r && x.r.window > 0)
  const observeCalls = observeLegs.map(({ r }) => {
    const twalWindow = Math.min(r.window * twalMult, twalMax)
    return { address: r.pool, abi: POOL_ABI, functionName: 'observe' as const, args: [[r.window, twalWindow, 0]] as const }
  })
  const s3 = await client.multicall({ multicallAddress: MULTICALL3, allowFailure: true, contracts: [...decCalls, ...observeCalls] })
  const decByToken = new Map<string, number>()
  tokenSet.forEach((t, i) => {
    const r = s3[i]
    if (r?.status === 'success') decByToken.set(t.toLowerCase(), Number(r.result))
  })
  const observeByLeg = new Map<number, { tickCumulatives: readonly bigint[]; secondsPerLiquidityX128s: readonly bigint[] }>()
  observeLegs.forEach(({ li }, k) => {
    const r = s3[decCalls.length + k]
    if (r?.status === 'success') {
      const res = r.result as readonly [readonly bigint[], readonly bigint[]]
      observeByLeg.set(li, { tickCumulatives: res[0], secondsPerLiquidityX128s: res[1] })
    }
  })

  // ── Compute price/liquidity per leg, then the actual ──
  const plOf = (r: Leg, li: number) => {
    const d0 = decByToken.get(r.token0.toLowerCase())
    const d1 = decByToken.get(r.token1.toLowerCase())
    if (d0 === undefined || d1 === undefined) return null
    const meta: PoolMetaDecimals = { decimals0: d0, decimals1: d1 }
    const ob = observeByLeg.get(li)
    return poolPriceLiquidity({
      meta,
      spotSqrtPriceX96: r.slot0Sqrt,
      spotLiquidity: r.liquidity,
      window: r.window,
      twalWindowMultiplier: twalMult,
      twalWindowMax: twalMax,
      tickCumulatives: ob ? (ob.tickCumulatives.slice(0, 3) as [bigint, bigint, bigint]) : undefined,
      secondsPerLiquidityX128: ob ? (ob.secondsPerLiquidityX128s.slice(0, 3) as [bigint, bigint, bigint]) : undefined,
    })
  }

  let actualDirect: number | null = null
  let actualPath: number | null = null
  const actualPaths: (number | null)[] = []
  const directPoolThresholds: OracleDirectPoolThreshold[] = []
  if (isDirect) {
    resolved.slice(0, directLegCount).forEach((r, li) => {
      if (!r) return
      const pl = plOf(r, li)
      const actual = pl ? Number(formatUnits(directActualQuote(pl, r.qti), 18)) : null
      directPoolThresholds.push({ address: r.pool, actual, twapWindow: r.window, kind: r.kind })
    })
    const actualValues = directPoolThresholds.map((pool) => pool.actual).filter((value): value is number => value != null)
    actualDirect = actualValues.length ? actualValues.reduce((sum, value) => sum + value, 0) : null
  }
  pathLegGroups.forEach((group, pathIndex) => {
    const firstIndex = directLegCount + pathLegGroups.slice(0, pathIndex).reduce((count, previous) => count + previous.length, 0)
    const r1 = resolved[firstIndex]
    const r2 = resolved[firstIndex + 1]
    let actual: number | null = null
    if (r1 && r2) {
      const pl1 = plOf(r1, firstIndex)
      const pl2 = plOf(r2, firstIndex + 1)
      if (pl1 && pl2) actual = Number(formatUnits(pathActualBase(pl1, r1.qti, pl2, r2.qti), 18))
    }
    actualPaths.push(actual)
  })
  actualPath = actualPaths[0] ?? null

  // The gateway can retain a non-zero global path threshold even when this
  // pair has no configured path. Do not render that orphan threshold as an
  // incomplete "Min TVL / Actual" row.
  return { minTvlDirect: toNum(minQ), actualDirect, directPools: directPoolThresholds, minTvlPath: paths.length ? toNum(minPB) : null, actualPath, actualPaths, twapWindows }
}
