/**
 * Aggregator swap callback — mirror of useSwapCallback for routes that come
 * from an external aggregator (Kyber, future 1inch, …) rather than BrownFi's
 * own pools.
 *
 * Returns the same { state, callback, error } shape as useSwapCallback so
 * the Swap page can call whichever path the chosen route requires without
 * branching on the consumer side.
 */
import { SwapCallbackState } from '@brownfi/sdk'
import { useMemo } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { getAggregatorById } from 'services/aggregators'
import { isBrownFiSource } from 'services/aggregators/types'
import type { UnifiedRoute } from './useBestSwapRoute'
import { useActiveWeb3React } from './index'
import { estimateGasWithMargin } from 'utils/estimateGasWithMargin'
import { beraFeeOverrides } from 'utils/beraGas'

export interface AggregatorSwapCallback {
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
}

export function useAggregatorSwapCallback(
  route: UnifiedRoute | null,
  /** basis points, 50 = 0.5%. */
  slippageBps: number,
  /** unix seconds. */
  deadline: number,
): AggregatorSwapCallback {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  return useMemo<AggregatorSwapCallback>(() => {
    // Only handle aggregator routes. BrownFi-native routes go through useSwapCallback.
    if (!route || isBrownFiSource(route.source) || !route.aggregatorQuote) {
      return { state: SwapCallbackState.INVALID, callback: null, error: null }
    }
    if (!account || !chainId || !library) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }

    const adapter = getAggregatorById(route.aggregatorQuote.aggregatorId)
    if (!adapter) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: `Unknown aggregator ${route.aggregatorQuote.aggregatorId}`,
      }
    }

    const callback = async (): Promise<string> => {
      const quote = route.aggregatorQuote
      if (!quote) throw new Error('No aggregator quote')

      // Stale-quote guard. Orchestration also flags isStale at render time;
      // this is the last-line check before signing.
      const now = Math.floor(Date.now() / 1000)
      if (now > quote.validUntil) {
        throw new Error('Quote expired — refresh and try again.')
      }

      const built = await adapter.buildSwap({
        chainId,
        account,
        quote,
        slippageBps,
        deadline,
      })

      // msg.value is the adapter's responsibility — it knows whether
      // the input side was native and what amount to attach.
      const signer =
        typeof (library as any)?.getSigner === 'function'
          ? (library as any).getSigner(account)
          : undefined
      if (!signer) throw new Error('No signer available')

      // Kyber under-estimates gas on multi-hop routes; a too-low limit makes
      // the executor's inner `.call{gas}` revert with "Call failed". Resolve a
      // live estimate (×1.25) at send time, falling back to the adapter hint.
      const gasLimit = await estimateGasWithMargin(
        signer,
        { to: built.to, data: built.data, value: built.value },
        built.gasLimit,
      )

      const response = await signer.sendTransaction({
        to: built.to,
        data: built.data,
        value: built.value,
        gasLimit,
        ...beraFeeOverrides(chainId),
      })

      addTransaction(response, {
        summary: `Swap via ${adapter.name}`,
      })

      return response.hash
    }

    return { state: SwapCallbackState.VALID, callback, error: null }
  }, [route, account, chainId, library, slippageBps, deadline, addTransaction])
}
