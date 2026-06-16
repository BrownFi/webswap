import { Token, TokenAmount, Pair, Currency } from '@brownfi/sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from 'hooks'

import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useVersion } from 'hooks/useVersion'
import { RPC_URLS, isV3Like, factoryV3Gen } from 'lib/sdk/constants/addresses'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI.abi)

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'

const RESERVES_ABI = [
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: '_reserve0', type: 'uint112' },
      { name: '_reserve1', type: 'uint112' },
      { name: '_blockTimestampLast', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

// Mirrors the shape the pair-construction memo reads off the legacy multicall's
// CallState: `{ result: { reserve0, reserve1 } | undefined, loading }`.
type ReserveSlot = { result?: { reserve0: bigint; reserve1: bigint }; loading: boolean }

// Resilient, self-contained reserve fetch via ONE viem Multicall3 aggregate3
// (allowFailure) — used ONLY by the swap routing path (useAllCommonPairs).
//
// Why not the shared legacy Redux multicall here: that multicall batches calls
// across the WHOLE app (great for the pool list's many rows), but its single
// per-block `aggregate` fetch gets starved on the V3-Official swap cold-start
// when the parallel viem quote/getPair calls saturate the RPC — so V2's
// reserves arrived seconds late and the V2 route looked missing. The swap page
// only has a handful of candidate pairs (V2 + V3 pilot + V3 official), so a
// dedicated batched read here costs ~1 extra multicall but resolves on time and
// independent of that contention. Pool/mint/burn keep the shared multicall.
// A whole-multicall failure (RPC down / rate-limited under the swap's parallel
// call load on flaky chains like HyperEVM) used to leave every slot undefined →
// every V2 pair read as NOT_EXISTS → a sticky, MISLEADING "No pool" / "no route"
// that only cleared on the next input change. Retry the multicall a bounded
// number of times, keeping the slots LOADING in between, so a transient RPC blip
// self-heals instead of flashing "No pool".
const RESERVES_MAX_RETRIES = 2
const RESERVES_RETRY_DELAY_MS = 1200

function useReservesMulticall(pairAddresses: (string | undefined)[], chainId: number): ReserveSlot[] {
  const addrKey = pairAddresses.join(',')
  const [state, setState] = useState<{ key: string; slots: ReserveSlot[] }>(() => ({
    key: '',
    slots: pairAddresses.map(() => ({ result: undefined, loading: true })),
  }))
  // Bounded retry on transient (whole-multicall) failure. `retryTick` re-runs the
  // effect without an address change; `retryCountRef` caps attempts and resets
  // only when the address SET actually changes (tracked via `lastKeyRef`).
  const [retryTick, setRetryTick] = useState(0)
  const retryCountRef = useRef(0)
  const lastKeyRef = useRef('')

  useEffect(() => {
    let stale = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    if (lastKeyRef.current !== addrKey) {
      lastKeyRef.current = addrKey
      retryCountRef.current = 0
    }

    const lookups: { index: number; address: string }[] = []
    pairAddresses.forEach((a, i) => {
      if (a) lookups.push({ index: i, address: a })
    })

    if (lookups.length === 0) {
      setState({ key: addrKey, slots: pairAddresses.map(() => ({ result: undefined, loading: false })) })
      return
    }

    // Mark loading on a genuine address change (not a re-run with the same set),
    // preserving prior slots so the UI doesn't flash empty mid-refetch.
    setState((prev) => ({
      key: addrKey,
      slots: prev.key === addrKey ? prev.slots : pairAddresses.map(() => ({ result: undefined, loading: true })),
    }))

    const run = async () => {
      const { createPublicClient, http } = await import('viem')
      const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
      const next: ReserveSlot[] = pairAddresses.map(() => ({ result: undefined, loading: false }))
      try {
        const responses = await client.multicall({
          contracts: lookups.map(({ address }) => ({
            address: address as `0x${string}`,
            abi: RESERVES_ABI,
            functionName: 'getReserves',
          })),
          multicallAddress: MULTICALL3,
          allowFailure: true,
        })
        responses.forEach((r, i) => {
          if (r.status !== 'success' || !r.result) return
          const [reserve0, reserve1] = r.result as readonly [bigint, bigint, number]
          next[lookups[i].index] = { result: { reserve0, reserve1 }, loading: false }
        })
      } catch {
        // The WHOLE multicall threw (RPC down / rate-limited / network) — TRANSIENT,
        // distinct from a per-pair allowFailure miss (a genuinely non-existent pair,
        // which we must NOT retry forever). Retry a bounded number of times, holding
        // the slots in LOADING so the caller doesn't render a false NOT_EXISTS.
        if (retryCountRef.current < RESERVES_MAX_RETRIES) {
          retryCountRef.current += 1
          retryTimer = setTimeout(() => {
            if (!stale) setRetryTick((t) => t + 1)
          }, RESERVES_RETRY_DELAY_MS)
          if (!stale) setState({ key: addrKey, slots: pairAddresses.map(() => ({ result: undefined, loading: true })) })
          return
        }
        // Retries exhausted → fall through with undefined slots (NOT_EXISTS).
      }
      if (!stale) setState({ key: addrKey, slots: next })
    }
    run()
    return () => {
      stale = true
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [addrKey, chainId, retryTick])

  // Length-safe view (state can lag a render behind a fast address change).
  return pairAddresses.map((_, i) => state.slots[i] ?? { result: undefined, loading: true })
}

// V3: look up pair address from factory (no CREATE2)
//
// Returns { addresses, loading }. `loading` is true between mount and the
// first multicall settling — without it the caller can't tell "factory says
// no pool" from "factory hasn't been asked yet" since both produce undefined
// slots. The Add-Liquidity page (`noLiquidity`) flips to "Create Pool & Supply"
// on a NOT_EXISTS verdict, so getting LOADING vs NOT_EXISTS right matters for
// the CTA label.
function useV3PairAddresses(
  tokens: [Token | undefined, Token | undefined][],
  chainId: number,
  version: number,
): { addresses: (string | undefined)[]; loading: boolean } {
  // Co-locate addresses + loading in a single state slot so each transition
  // (init → fetched, dep-change → re-fetch) is one setState call. Two separate
  // useState pairs tripped the `react-hooks` "synchronous setState in effect"
  // rule because the early-return path did `setAddresses(...) ; setLoading(false)`.
  const [state, setState] = useState<{ addresses: (string | undefined)[]; loading: boolean }>(() => ({
    addresses: tokens.map(() => undefined),
    // Default-loading on mount so the caller doesn't mistake an unfetched slot
    // for "factory says no pool" before the multicall settles.
    loading: true,
  }))

  useEffect(() => {
    if (!isV3Like(version) || !factoryV3Gen(version)[chainId]) {
      // Synchronous setState in an effect is the simplest way to express
      // "this chain doesn't support V3 — reset and stop." Functional update
      // doesn't help here (we want a fixed shape, not a derived one). The
      // `react-hooks/set-state-in-effect` rule is overly strict for this
      // dependency-reset pattern; `useReducer` would just rename the call.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ addresses: tokens.map(() => undefined), loading: false })
      return
    }

    const fetchAddresses = async () => {
      const { createPublicClient, http } = await import('viem')
      const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
      const factoryAddr = factoryV3Gen(version)[chainId]

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
        setState({ addresses: results, loading: false })
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
          // We construct the client without a `chain` field, so viem can't
          // auto-resolve Multicall3 from the chain config and throws
          // "client chain not configured". Universal canonical Multicall3
          // address (0xcA11…CA11) is deployed on every chain we support
          // (Bera, Linea, mainnet, etc.) — specify it explicitly.
          multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
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
      setState({ addresses: results, loading: false })
    }

    // Mark loading on dep change. Functional updater so we don't depend on
    // the state we're about to overwrite; preserves the previous addresses
    // so the UI doesn't flash an empty list while the new fetch is in flight.
    setState((prev) => ({ addresses: prev.addresses, loading: true }))
    fetchAddresses()
  }, [tokens.length, chainId, version])

  return state
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
  /**
   * When true, reserves are read via a dedicated viem Multicall3 batch
   * instead of the shared legacy Redux multicall. Used by the swap routing
   * path so V2's reserves resolve on time even when the V3-Official cold-start
   * saturates the RPC (see useReservesMulticall). Other surfaces (pool list,
   * mint, burn) leave this off to keep the legacy multicall's cross-component
   * batching, which is more RPC-efficient for many simultaneous pairs.
   */
  options?: { batchedReserves?: boolean },
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
      !isV3Like(version)
        ? tokens.map(([tokenA, tokenB]) =>
            tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB, version) : undefined
          )
        : tokens.map(() => undefined),
    [tokens, version],
  )

  // V3: look up from factory. Destructure to keep call-site identical to the
  // pre-refactor `(string | undefined)[]` shape plus the new loading flag.
  const { addresses: v3Addresses, loading: v3AddressesLoading } = useV3PairAddresses(tokens, chainId, version)

  const pairAddresses = isV3Like(version) ? v3Addresses : v1v2Addresses

  // Two reserve sources; exactly one does work (the other is fed an empty list
  // and no-ops) so Hook order stays stable. Swap routing opts into the batched
  // viem path; everything else uses the shared legacy multicall.
  const batched = !!options?.batchedReserves
  const legacyResults = useMultipleContractSingleData(
    batched ? [] : pairAddresses,
    PAIR_INTERFACE,
    'getReserves',
  )
  const batchedResults = useReservesMulticall(batched ? pairAddresses : [], chainId)
  const results = batched ? batchedResults : legacyResults

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenPair = tokens[i]
      if (!tokenPair) return [PairState.LOADING, null]
      const tokenA = tokenPair[0]
      const tokenB = tokenPair[1]

      // V3 factory lookup is async — until it settles, an undefined slot
      // means "unknown, still loading", not "factory says no pool". Without
      // this guard the Add-Liquidity page would briefly show "Create Pool
      // & Supply" on every V3 nav before falling back to "Supply" once the
      // reserves arrived.
      if (isV3Like(version) && v3AddressesLoading) return [PairState.LOADING, null]
      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      const pair = new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString()), version)
      // V3: override liquidityToken with real pair address from factory
      if (isV3Like(version) && pairAddresses[i]) {
        ;(pair as any).liquidityToken = new Token(chainId, pairAddresses[i]!, 18, 'BF-V3', 'BrownFi V3')
      }
      return [PairState.EXISTS, pair]
    })
  }, [results, tokens, version, pairAddresses, chainId, v3AddressesLoading])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0] ?? [PairState.LOADING, null]
}
