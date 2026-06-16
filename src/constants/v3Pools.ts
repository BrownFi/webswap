// Hardcoded V3 pools — temporary until the V3 indexer is ready.
// Update pair addresses after creating pools on new V3 factory.
import { ChainId } from 'lib/sdk/constants/chainId'

export type V3PoolConfig = {
  pair: string
  token0: { address: string; decimals: number; symbol: string; name: string }
  token1: { address: string; decimals: number; symbol: string; name: string }
}

export const V3_POOLS: Record<number, V3PoolConfig[]> = {
  [ChainId.BERA_MAINNET]: [
    {
      pair: '0x3E6200Dc34C3b5967E7bBdCf5FA74153348E9694',
      token0: { address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590', decimals: 18, symbol: 'WETH', name: 'WETH' },
      token1: { address: '0x549943e04f40284185054145c6E4e9568C1D3241', decimals: 6, symbol: 'USDC.e', name: 'Bridged USDC (Stargate)' },
    },
  ],
}

export function getV3PoolConfig(chainId: number | undefined, pairAddress: string | undefined): V3PoolConfig | undefined {
  if (!chainId || !pairAddress) return undefined
  const pools = V3_POOLS[chainId]
  if (!pools) return undefined
  const lower = pairAddress.toLowerCase()
  return pools.find((p) => p.pair.toLowerCase() === lower)
}
