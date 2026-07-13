import {
  CurrencyAmount,
  ETHER,
  ROUTER_ADDRESS_V1,
  ROUTER_ADDRESS_WITH_PRICE,
  TokenAmount,
  Trade,
  getRouterAddress,
} from '@brownfi/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { useTokenAllowance } from 'data/Allowances'
import { getTradeVersion, useV1TradeExchangeAddress } from 'data/V1'
import { useCallback, useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin, getTokenSymbol } from 'utils'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useActiveWeb3React } from './index'
import { beraFeeOverrides } from 'utils/beraGas'
import { useTokenContract } from './useContract'
import { Version } from './useToggledVersion'

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

    // Approve the swap amount + a 10% buffer (not exact, not unlimited). Exact
    // can land just short of the allowance when the swap pulls slightly more
    // (input-side slippage/fee/rounding) → transferFrom revert; the buffer
    // absorbs that while keeping blast radius limited vs MaxUint256. (Unlimited
    // approve was tested and did NOT remove the MetaMask warning — that warning
    // is not an allowance issue, so we keep a bounded approval here.)
    const amountRaw = BigNumber.from(amountToApprove.raw.toString()).mul(110).div(100).toString()
    const estimatedGas = await tokenContract.estimateGas.approve(spender, amountRaw)

    return tokenContract
      .approve(spender, amountRaw, {
        gasLimit: calculateGasMargin(estimatedGas),
        ...beraFeeOverrides(chainId),
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

// wraps useApproveCallback in the context of a swap. The approval target
// (router address) is derived from the trade's own pair version, not the
// global useVersion state — that way a V3 trade always approves the V3
// router even when the global state is pinned to V2 (and vice versa).
// Without this, the Phase 7 dual V2+V3 quoting would mis-approve.
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const { chainId } = useActiveWeb3React()

  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage],
  )
  const tradeIsV1 = getTradeVersion(trade) === Version.v1
  const v1ExchangeAddress = useV1TradeExchangeAddress(trade)

  // Trade.route.pairs[0].version is the actual pool version the swap will
  // hit; fall back to 2 when the trade is undefined (no approval needed).
  const tradePoolVersion: number = trade?.route?.pairs?.[0]?.version ?? 2

  return useApproveCallback(
    amountToApprove,
    tradeIsV1
      ? v1ExchangeAddress
      : chainId
      ? tradePoolVersion === 1
        ? ROUTER_ADDRESS_WITH_PRICE[chainId] || ROUTER_ADDRESS_V1[chainId]
        : getRouterAddress(chainId, tradePoolVersion)
      : '',
  )
}
