import { RPC_URLS, factoryV3Gen } from 'lib/sdk/constants/addresses'
import { createReadClient } from 'lib/sdk/rpc'

// Single source of truth for reading a BrownFi V3 pool's per-pair config.
// Previously the PairConfig→getConfig read + the 13-field tuple ABI + the
// Q64/PRECISION decoders were copy-pasted across useDevStats, useTradingFee,
// PairSettingsModal and useV3PoolsOnChain. They live here now.

/** Factory getter that returns the PairConfig contract address. */
export const PAIR_CONFIG_GETTER_ABI = [
  { inputs: [], name: 'pairConfig', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
] as const

/** PairConfig.getConfig(pool) → the full per-pair config struct. */
export const GET_CONFIG_ABI = [
  {
    inputs: [{ type: 'address' }],
    name: 'getConfig',
    outputs: [
      {
        components: [
          { name: 'kB', type: 'uint256' },
          { name: 'kQ', type: 'uint256' },
          { name: 'lambda', type: 'uint64' },
          { name: 'fee', type: 'uint32' },
          { name: 'feeSplit', type: 'uint32' },
          { name: 'compress', type: 'uint32' },
          { name: 'sSell', type: 'uint32' },
          { name: 'sBuy', type: 'uint32' },
          { name: 'fixS', type: 'uint32' },
          { name: 'disThreshold', type: 'uint32' },
          { name: 'sBound', type: 'uint32' },
          { name: 'pythWeight', type: 'uint32' },
          { name: 'gamma', type: 'uint32' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/** Raw config as returned on-chain: kB/kQ/lambda are Q64.64, the rest 1e8-scaled. */
export type RawV3Config = {
  kB: bigint
  kQ: bigint
  lambda: bigint
  fee: number
  feeSplit: number
  compress: number
  sSell: number
  sBuy: number
  fixS: number
  disThreshold: number
  sBound: number
  pythWeight: number
  gamma: number
}

const Q64 = 2n ** 64n
const PRECISION = 100_000_000n // 1e8

/** Decode a Q64.64 fixed-point value (kB / kQ / lambda) to a JS number. */
export const fromQ64 = (v: bigint): number => Number((v * 1_000_000n) / Q64) / 1_000_000

/** Decode a 1e8-scaled value (fee / spread / gamma / …) to a JS number. */
export const fromPrec = (v: number | bigint): number => Number(v) / Number(PRECISION)

/**
 * Read a V3 pool's config: factory.pairConfig() → pairConfig.getConfig(pool).
 * Resolves the factory for the pool's exact version (4 = Official, 3 = Pilot).
 * Returns null when the factory/RPC isn't available (caller falls back).
 */
export async function readV3PairConfig(
  chainId: number,
  version: number,
  poolAddress: string,
): Promise<RawV3Config | null> {
  const factoryAddr = factoryV3Gen(version)[chainId]
  if (!factoryAddr || !RPC_URLS[chainId]) return null
  const client = createReadClient(chainId)
  const configAddr = await client.readContract({
    address: factoryAddr as `0x${string}`,
    abi: PAIR_CONFIG_GETTER_ABI,
    functionName: 'pairConfig',
  })
  const config = await client.readContract({
    address: configAddr as `0x${string}`,
    abi: GET_CONFIG_ABI,
    functionName: 'getConfig',
    args: [poolAddress as `0x${string}`],
  })
  return config as unknown as RawV3Config
}
