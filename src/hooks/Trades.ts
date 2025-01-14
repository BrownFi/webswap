import { isTradeBetter } from 'utils/trades'
import { Currency, CurrencyAmount, Pair, Token, Trade } from '@brownfi/sdk'
import flatMap from 'lodash.flatmap'
import { useEffect, useMemo, useState } from 'react'

import {
  BASES_TO_CHECK_TRADES_AGAINST,
  CUSTOM_BASES,
  BETTER_TRADE_LESS_HOPS_THRESHOLD,
  ADDITIONAL_BASES
} from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from './index'
import { useUnsupportedTokens } from './Tokens'
import { useUserSingleHopOnly } from 'state/user/hooks'

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): Pair[] {
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
    () => flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase])),
    [bases]
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
            ...basePairs
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]

              const customBasesA: Token[] | undefined = customBases?.[tokenA.address]
              const customBasesB: Token[] | undefined = customBases?.[tokenB.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find(base => tokenB.equals(base))) return false
              if (customBasesB && !customBasesB.find(base => tokenA.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  )

  const allPairs = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
            return memo
          }, {})
      ),
    [allPairs]
  )
}

const MAX_HOPS = 1

type TradeExactIn = {
  trade: Trade | null
  loadingExactIn: boolean
}
/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): TradeExactIn {
  const [loading, setLoading] = useState(false)
  const [trade, setTrade] = useState<Trade | null>(null)
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut)
  const { account } = useActiveWeb3React()

  const [singleHopOnly] = useUserSingleHopOnly()

  useEffect(() => {
    const getTrade = async () => {
      setLoading(true)
      if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
        if (singleHopOnly) {
          const bestTradeIn = await Trade.bestTradeExactIn(account ?? '', allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: 1,
            maxNumResults: 1
          })
          setTrade(bestTradeIn?.[0] ?? null)
          return
        }
        // search through trades with varying hops, find best trade out of them
        let bestTradeSoFar: Trade | null = null
        for (let i = 1; i <= MAX_HOPS; i++) {
          const bestTradeIn = await Trade.bestTradeExactIn(account ?? '', allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: i,
            maxNumResults: 1
          })
          const currentTrade: Trade | null = bestTradeIn?.[0] ?? null
          // if current trade is best yet, save it
          if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
            bestTradeSoFar = currentTrade
          }
        }
        setTrade(bestTradeSoFar)
        setLoading(false)
        return
      }

      setTrade(null)
      setLoading(false)
    }

    const timeout = setTimeout(() => {
      getTrade()
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [allowedPairs?.length, currencyAmountIn?.raw.toString(), currencyOut?.name, singleHopOnly])

  return {
    trade: trade,
    loadingExactIn: loading
  }
}

type TradeExactOut = {
  trade: Trade | null
  loadingExactOut: boolean
}
/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): TradeExactOut {
  const [loading, setLoading] = useState(false)
  const [trade, setTrade] = useState<Trade | null>(null)

  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency)
  const { account } = useActiveWeb3React()

  const [singleHopOnly] = useUserSingleHopOnly()

  useEffect(() => {
    const getTrade = async () => {
      setLoading(true)
      if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
        if (singleHopOnly) {
          const bestTradeOut = await Trade.bestTradeExactOut(
            account ?? '',
            allowedPairs,
            currencyIn,
            currencyAmountOut,
            {
              maxHops: 1,
              maxNumResults: 1
            }
          )
          setTrade(bestTradeOut?.[0] ?? null)
          return
        }
        // search through trades with varying hops, find best trade out of them
        let bestTradeSoFar: Trade | null = null
        for (let i = 1; i <= MAX_HOPS; i++) {
          const bestTradeOut = await Trade.bestTradeExactOut(
            account ?? '',
            allowedPairs,
            currencyIn,
            currencyAmountOut,
            {
              maxHops: i,
              maxNumResults: 1
            }
          )
          const currentTrade = bestTradeOut?.[0] ?? null
          if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
            bestTradeSoFar = currentTrade
          }
        }
        setTrade(bestTradeSoFar)
        setLoading(false)
        return
      }
      setTrade(null)
      setLoading(false)
    }

    const timeout = setTimeout(() => {
      getTrade()
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [currencyIn?.name, currencyAmountOut?.raw?.toString(), allowedPairs?.length, singleHopOnly])

  return {
    trade: trade,
    loadingExactOut: loading
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
