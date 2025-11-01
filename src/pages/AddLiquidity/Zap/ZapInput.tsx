import { Currency, CurrencyAmount } from '@brownfi/sdk'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useEffect, useMemo } from 'react'
import { getApprovalBuffer } from '../utils'
import { tryParseAmount } from 'state/swap/hooks'

type ZapApprovalInfo = {
  approval: ApprovalState
  approve: () => Promise<void>
  currency: Currency | null
  requiresApproval: boolean
}

export type ZapInput = {
  id: string
  currency: Currency | null
  amount: string
}

export type ParsedZapInput = ZapInput & { parsedAmount?: CurrencyAmount }

type ZapTokenInputRowProps = {
  input: ParsedZapInput
  index: number
  onAmountChange: (value: string) => void
  onCurrencySelect?: (currency: Currency) => void
  onMax?: () => void
  onRemove?: () => void
  showMaxButton?: boolean
  canRemove?: boolean
  routerAddress?: string
  onApprovalInfoChange?: (inputId: string, info: ZapApprovalInfo | undefined) => void
}

const ZapTokenInputRow = ({
  input,
  index,
  onAmountChange,
  onCurrencySelect,
  onMax,
  showMaxButton = true,
  onRemove,
  canRemove,
  routerAddress,
  onApprovalInfoChange,
}: ZapTokenInputRowProps) => {
  const approvalAmount = useMemo(
    () => getApprovalBuffer(input.currency ? tryParseAmount(input.amount, input.currency) : undefined),
    [input.amount, input.currency],
  )
  const [approvalState, approveCallback] = useApproveCallback(approvalAmount, routerAddress)

  useEffect(() => {
    const hasCurrency = Boolean(input.currency)
    const hasAmount = Boolean(input.amount && parseFloat(input.amount) > 0)

    if (hasCurrency && hasAmount && routerAddress) {
      onApprovalInfoChange?.(input.id, {
        approval: approvalState,
        approve: approveCallback,
        currency: input.currency,
        requiresApproval: true,
      })
    } else {
      onApprovalInfoChange?.(input.id, undefined)
    }

    return () => {
      onApprovalInfoChange?.(input.id, undefined)
    }
  }, [
    approvalState,
    approvalAmount, // Should be `approveCallback` but it throws Warning: Maximum update depth exceeded
    input.id,
    input.currency,
    routerAddress,
    onApprovalInfoChange,
  ])

  return (
    <div className="relative">
      <CurrencyInputPanel
        value={input.amount}
        onUserInput={onAmountChange}
        onMax={onMax}
        showMaxButton={showMaxButton}
        currency={input.currency ?? null}
        onCurrencySelect={onCurrencySelect}
        otherCurrency={undefined}
        id={`zap-input-${input.id}`}
        showCommonBases
        label={`Token ${index + 1}`}
      />
      {canRemove && (
        <button
          onClick={onRemove}
          className="absolute top-[-8px] left-[-4px] z-10 bg-white/15 text-white/80 font-black hover:text-white  transition w-6 rounded-full"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default ZapTokenInputRow
