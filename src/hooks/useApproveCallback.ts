import {
  CurrencyAmount,
  ETHER,
  ROUTER_ADDRESS_V1,
  ROUTER_ADDRESS_WITH_PRICE,
  TokenAmount,
  Trade,
  getRouterAddress,
} from '@brownfi/sdk'
import { TransactionResponse } from '@ethersproject/providers'
import { useTokenAllowance } from 'data/Allowances'
import { getTradeVersion, useV1TradeExchangeAddress } from 'data/V1'
import { useCallback, useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin, getTokenSymbol } from 'utils'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useActiveWeb3React } from './index'
import { useTokenContract } from './useContract'
import { Version } from './useToggledVersion'
import { useVersion } from './useVersion'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account, chainId } = useActiveWeb3React()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return
    }
    if (!token || !tokenContract || !amountToApprove || !spender) {
      return
    }

    // Approve EXACTLY the swap / liquidity amount, not MaxUint256. Matches
    // the safer default used by Uniswap V3 UI / Matcha / 1inch — limits
    // blast radius if the spender contract is ever compromised or upgraded
    // unexpectedly. Trade-off: user re-approves on each swap with a
    // different amount; one extra tx per session is acceptable.
    const amountRaw = amountToApprove.raw.toString()
    const estimatedGas = await tokenContract.estimateGas.approve(spender, amountRaw)

    return tokenContract
      .approve(spender, amountRaw, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + getTokenSymbol(amountToApprove.currency, chainId),
          approval: { tokenAddress: token.address, spender: spender },
        })
      })
      .catch((error: Error) => {
        if ((error as any)?.code !== 4001) {
          console.error('Approval failed', error)
        }
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const { chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage],
  )
  const tradeIsV1 = getTradeVersion(trade) === Version.v1
  const v1ExchangeAddress = useV1TradeExchangeAddress(trade)

  return useApproveCallback(
    amountToApprove,
    tradeIsV1
      ? v1ExchangeAddress
      : chainId
      ? version === 1
        ? ROUTER_ADDRESS_WITH_PRICE[chainId] || ROUTER_ADDRESS_V1[chainId]
        : getRouterAddress(chainId, version)
      : '',
  )
}
