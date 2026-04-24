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
      pair: '0x8c177a248011b31ebe6c8e0aac0571ee0a08f8c3',
      token0: { address: '0x6969696969696969696969696969696969696969', decimals: 18, symbol: 'WBERA', name: 'Wrapped Bera' },
      token1: { address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', decimals: 18, symbol: 'HONEY', name: 'Honey' },
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
