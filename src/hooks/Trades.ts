import { Currency, CurrencyAmount, Pair, Token, Trade } from '@brownfi/sdk'
import { useEffect, useMemo, useRef, useState } from 'react'

// A quote can fail transiently — an RPC timeout, a Hermes (Pyth) fetch blip, a
// JSON-RPC rate-limit under the heavy concurrent load of an initial page load
// (V2 + V3 + V4 pipelines + aggregators + indexer all firing at once). When
// that happens the SDK skips the pair and resolves with no trade, which looks
// identical to a genuinely empty pool — so the route silently vanishes and,
// because the effect only re-runs on input change, NEVER recovers. We retry a
// bounded number of times (only when the SDK flags a transient error, never on
// a clean insufficient-liquidity result) so a momentary blip self-heals.
const MAX_QUOTE_RETRIES = 2
const QUOTE_RETRY_DELAY_MS = 1500

import { BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES, ADDITIONAL_BASES } from 'constants/common'
import { PairState, usePairs } from 'data/Reserves'
import { wrappedCurrency } from 'utils/wrappedCurrency'

import { useActiveWeb3React } from './index'
import { useUnsupportedTokens } from './Tokens'
import { useUserSingleHopOnly } from 'state/user/hooks'

function useAllCommonPairs(
  currencyA?: Currency,
  currencyB?: Currency,
  versionOverride?: number,
): { pairs: Pair[]; loading: boolean } {
  const { chainId } = useActiveWeb3React()

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const bases: Token[] = useMemo(() => {
    if (!chainId) return []

    const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
    const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : []
    const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : []

    return [...common, ...additionalA, ...additionalB]
  }, [chainId, tokenA, tokenB])

  const basePairs: [Token, Token][] = useMemo(
    () => bases.flatMap((base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
    [bases],
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]

              const customBasesA: Token[] | undefined = customBases?.[tokenA.address]
              const customBasesB: Token[] | undefined = customBases?.[tokenB.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false
              if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId],
  )

  // Swap routing reads reserves via the dedicated batched viem multicall so V2
  // resolves on time even under the V3-Official cold-start RPC contention
  // (see useReservesMulticall in data/Reserves).
  const allPairs = usePairs(allPairCombinations, versionOverride, { batchedReserves: true })

  // only pass along valid pairs, non-duplicated pairs
  const pairs = useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
            return memo
          }, {}),
      ),
    [allPairs],
  )

  // True while ANY candidate pair is still resolving (V3 factory.getPair +
  // reserve reads are async and can take ~1.5s). Consumers fold this into
  // their loading flag so the UI keeps a skeleton up during the reserves-load
  // window — otherwise an empty-pairs pass looks like a finished quote and the
  // loading indicator clears early (dead zone, esp. on no-aggregator V3 pairs).
  const loading = useMemo(() => allPairs.some(([state]) => state === PairState.LOADING), [allPairs])

  return { pairs, loading }
}

type TradeExactIn = {
  trade: Trade | null
  loadingExactIn: boolean
  isInsufficient?: boolean
  /** True when the pool rejected the trade for exceeding its per-swap cap
   *  (curve limit), not because it's empty — UI should say "reduce amount". */
  maxExceeded?: boolean
  /** True when at least one pool exists for this pair at this version. Lets the
   *  UI tell "no pool deployed" apart from "pool exists but too thin". */
  hasPools?: boolean
}
/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  versionOverride?: number,
): TradeExactIn {
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(false)
  const [isInsufficient, setInsufficient] = useState(false)
  const [maxExceeded, setMaxExceeded] = useState(false)

  const { pairs: allowedPairs, loading: pairsLoading } = useAllCommonPairs(
    currencyAmountIn?.currency,
    currencyOut,
    versionOverride,
  )
  const { account } = useActiveWeb3React()

  const [singleHopOnly] = useUserSingleHopOnly()

  // Bumping this re-runs the quote effect WITHOUT an input change — used to
  // retry after a transient failure. `retryCountRef` bounds the attempts; it's
  // reset inside the effect when the actual inputs change (not on a retry
  // re-run) so each new quote gets a fresh budget.
  const [retryTick, setRetryTick] = useState(0)
  const retryCountRef = useRef(0)
  const lastSigRef = useRef('')

  useEffect(() => {
    let stale = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    // Reset the retry budget when the inputs themselves changed (vs. a retry
    // re-run, where the signature is identical and retryTick advanced).
    const inputSig = `${allowedPairs?.length}|${currencyAmountIn?.raw?.toString()}|${currencyOut?.name}|${singleHopOnly}`
    if (lastSigRef.current !== inputSig) {
      lastSigRef.current = inputSig
      retryCountRef.current = 0
    }

    // Schedules a bounded retry when a quote came back empty due to a TRANSIENT
    // error (RPC/Hermes blip) rather than a real "no route". Returns true when
    // a retry is pending so the caller keeps the loading state up. We keep
    // loading rather than flashing "no route" → retry → route.
    const scheduleRetryIfTransient = (foundTrade: Trade | null, list?: { transientError?: boolean }): boolean => {
      if (foundTrade || !list?.transientError || retryCountRef.current >= MAX_QUOTE_RETRIES) return false
      retryTimer = setTimeout(() => {
        if (stale) return
        retryCountRef.current += 1
        setRetryTick((t) => t + 1)
      }, QUOTE_RETRY_DELAY_MS)
      return true
    }

    // Engage loading synchronously on input/pair change — before the 300ms
    // debounce — so the UI never sees a false-negative gap while the debounce
    // and the async quote run.
    if (currencyAmountIn && currencyOut) setLoading(true)

    const getTrade = async () => {
      setLoading(true)
      setInsufficient(false)
      setMaxExceeded(false)
      if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
        if (singleHopOnly) {
          const bestTradeIn = await Trade.bestTradeExactIn(account ?? '', allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: 1,
            maxNumResults: 1,
          }).catch((error) => {
            if (!stale) {
              setInsufficient(
                error.message.includes('INSUFFICIENT') ||
                  error.message.includes('MAX_90_PERCENT_OF_RESERVE') ||
                  error.message.includes('MAX_80_PERCENT_OF_RESERVE'),
              )
            }
          })
          if (!stale) {
            const foundTrade = bestTradeIn?.[0] ?? null
            // SDK swallows INSUFFICIENT_RESERVES per-pair and returns []. If we
            // have pairs but no trade found, the pool is too thin → flag it.
            if (!foundTrade && Array.isArray(bestTradeIn) && bestTradeIn.length === 0) setInsufficient(true)
            if (bestTradeIn?.maxExceeded) setMaxExceeded(true)
            const retrying = scheduleRetryIfTransient(foundTrade, bestTradeIn ?? undefined)
            setTrade(foundTrade)
            setLoading(retrying)
          }
          return
        }
        const bestTradeIn = await Trade.bestTradeExactIn(
          account ?? '',
          allowedPairs,
          currencyAmountIn,
          currencyOut,
        ).catch((error) => {
          if (!stale) {
            setInsufficient(
              error.message.includes('INSUFFICIENT') ||
                error.message.includes('MAX_90_PERCENT_OF_RESERVE') ||
                error.message.includes('MAX_80_PERCENT_OF_RESERVE'),
            )
          }
        })
        if (!stale) {
          const foundTrade = bestTradeIn?.[0] ?? null
          if (!foundTrade && Array.isArray(bestTradeIn) && bestTradeIn.length === 0) setInsufficient(true)
          if (bestTradeIn?.maxExceeded) setMaxExceeded(true)
          const retrying = scheduleRetryIfTransient(foundTrade, bestTradeIn ?? undefined)
          setTrade(foundTrade)
          setLoading(retrying)
        }
        return
      }

      if (!stale) {
        setTrade(null)
        setLoading(false)
      }
    }

    const timeout = setTimeout(() => {
      getTrade()
    }, 300)

    return () => {
      stale = true
      clearTimeout(timeout)
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [allowedPairs?.length, currencyAmountIn?.raw.toString(), currencyOut?.name, singleHopOnly, retryTick])

  return {
    trade: trade,
    // Stay loading while reserves/pair addresses are still resolving so the
    // skeleton doesn't clear during the on-chain pair-lookup window.
    loadingExactIn: loading || pairsLoading,
    isInsufficient: isInsufficient && !trade,
    maxExceeded: maxExceeded && !trade,
    hasPools: allowedPairs.length > 0,
  }
}

type TradeExactOut = {
  trade: Trade | null
  loadingExactOut: boolean
  isInsufficient?: boolean
  maxExceeded?: boolean
  /** True when at least one pool exists for this pair at this version. */
  hasPools?: boolean
}
/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
  versionOverride?: number,
): TradeExactOut {
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(false)
  const [isInsufficient, setInsufficient] = useState(false)
  const [maxExceeded, setMaxExceeded] = useState(false)

  const { pairs: allowedPairs, loading: pairsLoading } = useAllCommonPairs(
    currencyIn,
    currencyAmountOut?.currency,
    versionOverride,
  )
  const { account } = useActiveWeb3React()

  const [singleHopOnly] = useUserSingleHopOnly()

  // Transient-failure retry — see useTradeExactIn for the rationale.
  const [retryTick, setRetryTick] = useState(0)
  const retryCountRef = useRef(0)
  const lastSigRef = useRef('')

  useEffect(() => {
    let stale = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    // Reset the retry budget when the inputs themselves changed (vs. a retry
    // re-run, where the signature is identical and retryTick advanced).
    const inputSig = `${allowedPairs?.length}|${currencyAmountOut?.raw?.toString()}|${currencyIn?.name}|${singleHopOnly}`
    if (lastSigRef.current !== inputSig) {
      lastSigRef.current = inputSig
      retryCountRef.current = 0
    }

    const scheduleRetryIfTransient = (foundTrade: Trade | null, list?: { transientError?: boolean }): boolean => {
      if (foundTrade || !list?.transientError || retryCountRef.current >= MAX_QUOTE_RETRIES) return false
      retryTimer = setTimeout(() => {
        if (stale) return
        retryCountRef.current += 1
        setRetryTick((t) => t + 1)
      }, QUOTE_RETRY_DELAY_MS)
      return true
    }

    // Engage loading synchronously on input/pair change — before the 300ms
    // debounce — so the UI never sees a false-negative gap.
    if (currencyIn && currencyAmountOut) setLoading(true)

    const getTrade = async () => {
      setTrade(null)
      setLoading(true)
      setInsufficient(false)
      setMaxExceeded(false)
      if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
        if (singleHopOnly) {
          const bestTradeOut = await Trade.bestTradeExactOut(
            account ?? '',
            allowedPairs,
            currencyIn,
            currencyAmountOut,
            {
              maxHops: 1,
              maxNumResults: 1,
            },
          ).catch((error) => {
            if (!stale) {
              setInsufficient(
                error.message.includes('INSUFFICIENT') ||
                  error.message.includes('MAX_90_PERCENT_OF_RESERVE') ||
                  error.message.includes('MAX_80_PERCENT_OF_RESERVE'),
              )
            }
          })
          if (!stale) {
            const foundTrade = bestTradeOut?.[0] ?? null
            // SDK swallows INSUFFICIENT_RESERVES per-pair and returns []. If we
            // have pairs but no trade found, the pool is too thin → flag it.
            if (!foundTrade && Array.isArray(bestTradeOut) && bestTradeOut.length === 0) setInsufficient(true)
            if (bestTradeOut?.maxExceeded) setMaxExceeded(true)
            const retrying = scheduleRetryIfTransient(foundTrade, bestTradeOut ?? undefined)
            setTrade(foundTrade)
            setLoading(retrying)
          }
          return
        }

        const bestTradeOut = await Trade.bestTradeExactOut(
          account ?? '',
          allowedPairs,
          currencyIn,
          currencyAmountOut,
        ).catch((error) => {
          if (!stale) {
            setInsufficient(
              error.message.includes('INSUFFICIENT') ||
                error.message.includes('MAX_90_PERCENT_OF_RESERVE') ||
                error.message.includes('MAX_80_PERCENT_OF_RESERVE'),
            )
          }
        })
        if (!stale) {
          const foundTrade = bestTradeOut?.[0] ?? null
          if (!foundTrade && Array.isArray(bestTradeOut) && bestTradeOut.length === 0) setInsufficient(true)
          if (bestTradeOut?.maxExceeded) setMaxExceeded(true)
          const retrying = scheduleRetryIfTransient(foundTrade, bestTradeOut ?? undefined)
          setTrade(foundTrade)
          setLoading(retrying)
        }
        return
      }
      if (!stale) {
        setLoading(false)
      }
    }

    const timeout = setTimeout(() => {
      getTrade()
    }, 300)

    return () => {
      stale = true
      clearTimeout(timeout)
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [currencyIn?.name, currencyAmountOut?.raw?.toString(), allowedPairs?.length, singleHopOnly, retryTick])

  return {
    trade: trade,
    loadingExactOut: loading || pairsLoading,
    isInsufficient: isInsufficient && !trade,
    maxExceeded: maxExceeded && !trade,
    hasPools: allowedPairs.length > 0,
  }
}

export function useIsTransactionUnsupported(currencyIn?: Currency, currencyOut?: Currency): boolean {
  const unsupportedTokens: { [address: string]: Token } = useUnsupportedTokens()
  const { chainId } = useActiveWeb3React()

  const tokenIn = wrappedCurrency(currencyIn, chainId)
  const tokenOut = wrappedCurrency(currencyOut, chainId)

  // if unsupported list loaded & either token on list, mark as unsupported
  if (unsupportedTokens) {
    if (tokenIn && Object.keys(unsupportedTokens).includes(tokenIn.address)) {
      return true
    }
    if (tokenOut && Object.keys(unsupportedTokens).includes(tokenOut.address)) {
      return true
    }
  }

  return false
}
