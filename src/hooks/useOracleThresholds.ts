import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { createReadClient } from 'lib/sdk/rpc'
import { ORACLE_GATEWAY_ADDRESS } from 'lib/sdk/constants/addresses'

// OracleGateway view getters. minLiquidityInQuote/minPathLiquidityInBase are WAD
// (1e18)-scaled amounts of the quote / base token respectively; twapWindow is seconds.
const ORACLE_ABI = [
  { type: 'function', name: 'minLiquidityInQuote', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'minPathLiquidityInBase', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'v3Pools', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'address' }] },
  {
    type: 'function',
    name: 'v3PoolPaths',
    stateMutability: 'view',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [
      { name: 'uniV3Pair1', type: 'address' },
      { name: 'quoteTokenIndex1', type: 'uint8' },
      { name: 'uniV3Pair2', type: 'address' },
      { name: 'quoteTokenIndex2', type: 'uint8' },
    ],
  },
  { type: 'function', name: 'twapWindow', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'address' }], outputs: [{ type: 'uint32' }] },
] as const

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const
const ZERO = '0x0000000000000000000000000000000000000000'

export interface OracleThresholds {
  /** Min oracle liquidity for the DIRECT pool, in QUOTE-token units (WAD already applied). null when unset (0). */
  minTvlDirect: number | null
  /** Min oracle liquidity for the two-hop PATH, in BASE-token units (WAD already applied). null when unset (0). */
  minTvlPath: number | null
  /** Distinct TWAP windows (seconds) across the pair's oracle pools/legs. */
  twapWindows: number[]
}

/**
 * Reads a BrownFi V3 pair's oracle liquidity thresholds + TWAP window(s) live from the
 * OracleGateway — two batched multicalls (thresholds+pool addresses, then twapWindow per
 * pool). These are static config (set once per pool), so cache hard and never poll.
 */
export function useOracleThresholds(
  chainId: number | undefined,
  pairAddress: string | undefined,
  enabled = true,
) {
  return useQuery<OracleThresholds | null>({
    queryKey: ['oracleThresholds', chainId, pairAddress?.toLowerCase()],
    enabled: enabled && !!chainId && !!pairAddress && !!ORACLE_GATEWAY_ADDRESS[chainId as number],
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    queryFn: () => fetchOracleThresholds(chainId as number, pairAddress as string),
  })
}

async function fetchOracleThresholds(chainId: number, pairAddress: string): Promise<OracleThresholds | null> {
  const oracle = ORACLE_GATEWAY_ADDRESS[chainId]
  if (!oracle) return null
  const client = createReadClient(chainId)
  const pair = pairAddress as `0x${string}`
  const o = oracle as `0x${string}`

  // Stage 1: thresholds + oracle pool/path addresses (one multicall).
  const s1 = await client.multicall({
    multicallAddress: MULTICALL3,
    allowFailure: true,
    contracts: [
      { address: o, abi: ORACLE_ABI, functionName: 'minLiquidityInQuote', args: [pair] },
      { address: o, abi: ORACLE_ABI, functionName: 'minPathLiquidityInBase', args: [pair] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 0n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3Pools', args: [pair, 1n] },
      { address: o, abi: ORACLE_ABI, functionName: 'v3PoolPaths', args: [pair, 0n] },
    ],
  })
  const ok = <T,>(i: number): T | undefined => (s1[i]?.status === 'success' ? (s1[i].result as T) : undefined)
  const minQ = ok<bigint>(0)
  const minPB = ok<bigint>(1)
  const direct0 = ok<string>(2)
  const direct1 = ok<string>(3)
  const path = ok<readonly [string, number, string, number]>(4)

  const pools: string[] = []
  for (const a of [direct0, direct1]) if (a && a.toLowerCase() !== ZERO) pools.push(a)
  if (path && path[0].toLowerCase() !== ZERO) {
    pools.push(path[0])
    if (path[2].toLowerCase() !== ZERO) pools.push(path[2])
  }

  // Stage 2: twapWindow per oracle pool (one multicall).
  let twapWindows: number[] = []
  if (pools.length) {
    const s2 = await client.multicall({
      multicallAddress: MULTICALL3,
      allowFailure: true,
      contracts: pools.map((p) => ({ address: o, abi: ORACLE_ABI, functionName: 'twapWindow' as const, args: [pair, p as `0x${string}`] })),
    })
    twapWindows = Array.from(
      new Set(s2.filter((r) => r.status === 'success').map((r) => Number(r.result)).filter((n) => n > 0)),
    )
  }

  const toNum = (v: bigint | undefined) => (v && v > 0n ? Number(formatUnits(v, 18)) : null)
  return { minTvlDirect: toNum(minQ), minTvlPath: toNum(minPB), twapWindows }
}
