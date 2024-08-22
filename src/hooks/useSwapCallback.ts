import { TransactionResponse } from '@ethersproject/providers'
import { callSwapContract, SwapCallbackState, Trade } from '@brownfi/sdk'
import { useMemo } from 'react'
import { INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { getTradeVersion } from '../data/V1'
import { useTransactionAdder } from '../state/transactions/hooks'
import { getTokenSymbol, isAddress, shortenAddress } from '../utils'
import { useActiveWeb3React } from './index'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
import { Version } from './useToggledVersion'

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const deadline = useTransactionDeadline()

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    const tradeVersion = getTradeVersion(trade)

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const response = await callSwapContract(
          trade,
          account,
          allowedSlippage,
          recipient,
          chainId,
          library as any,
          deadline as any
        )
        const inputSymbol = getTokenSymbol(trade.inputAmount?.currency, chainId)
        const outputSymbol = getTokenSymbol(trade.outputAmount?.currency, chainId)
        const inputAmount = trade.inputAmount?.toSignificant(3)
        const outputAmount = trade.outputAmount?.toSignificant(3)

        const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
        const withRecipient =
          recipient === account
            ? base
            : `${base} to ${
                recipientAddressOrName && isAddress(recipientAddressOrName)
                  ? shortenAddress(recipientAddressOrName)
                  : recipientAddressOrName
              }`

        const withVersion =
          tradeVersion === Version.v2 ? withRecipient : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`

        addTransaction(response as TransactionResponse, {
          summary: withVersion
        })
        return response.hash
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, deadline, addTransaction])
}
