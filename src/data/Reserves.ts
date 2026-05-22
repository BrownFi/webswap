import { Token, TokenAmount, Pair, Currency } from '@brownfi/sdk'
import { useEffect, useMemo, useState } from 'react'
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from 'hooks'

import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useVersion } from 'hooks/useVersion'
import { FACTORY_ADDRESS_V3, RPC_URLS } from 'lib/sdk/constants/addresses'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI.abi)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

// V3: look up pair address from factory (no CREATE2)
function useV3PairAddresses(
  tokens: [Token | undefined, Token | undefined][],
  chainId: number,
  version: number,
): (string | undefined)[] {
  const [addresses, setAddresses] = useState<(string | undefined)[]>(() => tokens.map(() => undefined))

  useEffect(() => {
    if (version !== 3 || !FACTORY_ADDRESS_V3[chainId]) {
      setAddresses(tokens.map(() => undefined))
      return
    }

    const fetchAddresses = async () => {
      const { createPublicClient, http } = await import('viem')
      const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
      const factoryAddr = FACTORY_ADDRESS_V3[chainId]

      // Pre-filter: track which slots correspond to valid token pairs that
      // need an RPC lookup. Invalid slots (missing token, same-token pair)
      // skip the multicall entirely; results array fills them as undefined
      // at the merge step below.
      const lookups: Array<{ index: number; tokenA: Token; tokenB: Token }> = []
      tokens.forEach(([tokenA, tokenB], index) => {
        if (tokenA && tokenB && !tokenA.equals(tokenB)) {
          lookups.push({ index, tokenA, tokenB })
        }
      })

      const results: (string | undefined)[] = tokens.map(() => undefined)
      if (lookups.length === 0) {
        setAddresses(results)
        return
      }

      // ONE multicall instead of N parallel readContracts. With 3 candidate
      // pair tuples that's 3 RPC calls → 1. The savings compound when the
      // routing layer adds more bases.
      try {
        const factoryAbi = [{ inputs: [{ type: 'address' }, { type: 'address' }], name: 'getPair', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' }] as const
        const responses = await client.multicall({
          contracts: lookups.map(({ tokenA, tokenB }) => ({
            address: factoryAddr as `0x${string}`,
            abi: factoryAbi,
            functionName: 'getPair',
            args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`],
          })),
          allowFailure: true,
        })
        responses.forEach((r, i) => {
          if (r.status !== 'success') return
          const pair = r.result as string
          if (pair && pair !== '0x0000000000000000000000000000000000000000') {
            results[lookups[i].index] = pair
          }
        })
      } catch {
        // Defensive: multicall down → fall through with undefined slots.
        // PairState.NOT_EXISTS renders for those, which is the same outcome
        // as the previous per-call try/catch returning undefined.
      }
      setAddresses(results)
    }

    fetchAddresses()
  }, [tokens.length, chainId, version])

  return addresses
}

export function usePairs(
  currencies: [Currency | undefined, Currency | undefined][],
  /**
   * Optional version override. The Swap surface is V2-only post-unified-
   * router refactor, so it passes 2 here regardless of what the global
   * version state says (which still tracks the Add/Remove Liquidity
   * surface's V2/V3 toggle).
   */
  versionOverride?: number,
): [PairState, Pair | null][] {
  const { chainId } = useActiveWeb3React()
  const { version: appVersion } = useVersion({ chainId })
  const version = versionOverride ?? appVersion

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]) as [Token | undefined, Token | undefined][],
    [chainId, currencies],
  )

  // V1/V2: compute via CREATE2
  const v1v2Addresses = useMemo(
    () =>
      version !== 3
        ? tokens.map(([tokenA, tokenB]) =>
            tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB, version) : undefined
          )
        : tokens.map(() => undefined),
    [tokens, version],
  )

  // V3: look up from factory
  const v3Addresses = useV3PairAddresses(tokens, chainId, version)

  const pairAddresses = version === 3 ? v3Addresses : v1v2Addresses

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenPair = tokens[i]
      if (!tokenPair) return [PairState.LOADING, null]
      const tokenA = tokenPair[0]
      const tokenB = tokenPair[1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      const pair = new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString()), version)
      // V3: override liquidityToken with real pair address from factory
      if (version === 3 && pairAddresses[i]) {
        ;(pair as any).liquidityToken = new Token(chainId, pairAddresses[i]!, 18, 'BF-V3', 'BrownFi V3')
      }
      return [PairState.EXISTS, pair]
    })
  }, [results, tokens, version, pairAddresses, chainId])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0] ?? [PairState.LOADING, null]
}
