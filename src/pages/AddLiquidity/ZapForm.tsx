import { Currency, CurrencyAmount, Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { AutoColumn, ColumnCenter } from 'components/Column'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { Dots } from 'components/swap/styleds'
import { RowBetween } from 'components/Row'
import { useToast } from 'containers/ToastProvider'
import { PairState } from 'data/Reserves'
import { useCallback, useContext, useMemo, useState } from 'react'
import { Field } from 'state/mint/actions'
import { tryParseAmount } from 'state/swap/hooks'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { getTokenSymbol } from 'utils'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { getApprovalBuffer } from './utils'
import {
  executeKyberZapTransaction,
  getKyberZapRouteData,
  isZapSupportedOnChain,
  KyberZapRouteData,
} from './zapHelpers'
import { useActiveWeb3React } from 'hooks'
import { Plus } from 'react-feather'
import { ThemeContext } from 'styled-components'
import { ZapRoutePreview } from './ZapRoutePreview'

type ZapFormProps = {
  pair?: Pair
  pairState: PairState
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  allowedSlippage: number
}

const ZERO_AMOUNTS: Record<Field, string> = {
  [Field.CURRENCY_A]: '',
  [Field.CURRENCY_B]: '',
}

export function ZapForm({ pair, pairState, currencies, currencyBalances, allowedSlippage }: ZapFormProps) {
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const { createToast } = useToast()

  const [amounts, setAmounts] = useState<Record<Field, string>>({ ...ZERO_AMOUNTS })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parsedAmounts: { [field in Field]?: CurrencyAmount } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: tryParseAmount(amounts[Field.CURRENCY_A], currencies[Field.CURRENCY_A]),
      [Field.CURRENCY_B]: tryParseAmount(amounts[Field.CURRENCY_B], currencies[Field.CURRENCY_B]),
    }
  }, [amounts, currencies])

  const userSuppliedFields = useMemo(
    () =>
      [Field.CURRENCY_A, Field.CURRENCY_B].filter((field) => {
        const amount = parsedAmounts[field]
        return Boolean(amount && amount.greaterThan('0'))
      }),
    [parsedAmounts],
  )

  const supportsZap = useMemo(() => isZapSupportedOnChain(chainId), [chainId])

  const isRouteAvailable = Boolean(
    supportsZap && pair && pairState === PairState.EXISTS && chainId && account && userSuppliedFields.length > 0,
  )

  const routeQueryKey = useMemo(() => {
    const amountKey = userSuppliedFields.map((field) => `${field}:${parsedAmounts[field]?.raw.toString() ?? '0'}`)
    return ['kyberZapRoute', chainId, pair?.liquidityToken.address, account, allowedSlippage, amountKey]
  }, [chainId, pair, account, allowedSlippage, userSuppliedFields, parsedAmounts])

  const { data: zapRouteData, error: zapRouteError } = useQuery<KyberZapRouteData>({
    queryKey: routeQueryKey,
    queryFn: () =>
      getKyberZapRouteData({
        chainId: chainId!,
        pair: pair!,
        userSuppliedFields,
        currencies,
        parsedAmounts,
        allowedSlippage,
        account: account!,
      }),
    enabled: isRouteAvailable,
  })

  const zapError = useMemo(() => {
    if (!supportsZap) {
      return 'Zap not supported on this network'
    }

    if (!pair || pairState !== PairState.EXISTS) {
      return 'Pool unavailable for zap'
    }

    if (!chainId || !account || !library) {
      return 'Connect Wallet'
    }

    if (userSuppliedFields.length === 0) {
      return 'Enter an amount'
    }

    if (zapRouteError) {
      return 'Failed to get zap routes'
    }

    for (const field of userSuppliedFields) {
      const parsedAmount = parsedAmounts[field]
      const balance = currencyBalances[field]
      if (parsedAmount && balance && balance.lessThan(parsedAmount)) {
        const currency = currencies[field]
        const symbol = getTokenSymbol(currency, chainId ?? undefined)
        return `Insufficient ${symbol ?? ''} balance`.trim()
      }
    }

    return undefined
  }, [
    supportsZap,
    pair,
    pairState,
    chainId,
    account,
    library,
    userSuppliedFields,
    parsedAmounts,
    currencyBalances,
    currencies,
  ])
  const isFormValid = !zapError

  const approvalAmounts = useMemo(() => {
    return {
      [Field.CURRENCY_A]: getApprovalBuffer(parsedAmounts[Field.CURRENCY_A]),
      [Field.CURRENCY_B]: getApprovalBuffer(parsedAmounts[Field.CURRENCY_B]),
    }
  }, [parsedAmounts])

  const [approvalA, approveACallback] = useApproveCallback(
    approvalAmounts[Field.CURRENCY_A],
    zapRouteData?.routerAddress,
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    approvalAmounts[Field.CURRENCY_B],
    zapRouteData?.routerAddress,
  )

  const approvals = useMemo(
    () =>
      userSuppliedFields.map((field) => ({
        field,
        approval: field === Field.CURRENCY_A ? approvalA : approvalB,
        callback: field === Field.CURRENCY_A ? approveACallback : approveBCallback,
        currency: currencies[field],
      })),
    [userSuppliedFields, approvalA, approvalB, approveACallback, approveBCallback, currencies],
  )

  const approvalsPending = approvals.filter(({ approval }) => approval !== ApprovalState.APPROVED)

  const handleInput = useCallback((field: Field, value: string) => {
    setAmounts((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleMax = useCallback(
    (field: Field) => {
      const max = maxAmountSpend(currencyBalances[field])
      setAmounts((prev) => ({
        ...prev,
        [field]: max?.toExact() ?? '',
      }))
    },
    [currencyBalances],
  )

  const handleSubmit = useCallback(async () => {
    if (!chainId || !account || !library || !zapRouteData) {
      return
    }

    try {
      setIsSubmitting(true)

      await executeKyberZapTransaction({
        chainId,
        account,
        routeData: zapRouteData,
        library,
      })

      setAmounts({ ...ZERO_AMOUNTS })
      setIsSubmitting(false)

      createToast('Zap Successful', 'success')
    } catch (error) {
      setIsSubmitting(false)
      if ((error as any)?.code !== 4001) {
        console.error(error)
      }
      if (typeof (error as any)?.reason === 'string') {
        createToast((error as any)?.reason, 'error')
      }
    }
  }, [chainId, account, library, zapRouteData])

  return (
    <AutoColumn gap="20px">
      <CurrencyInputPanel
        value={amounts[Field.CURRENCY_A]}
        onUserInput={(value) => handleInput(Field.CURRENCY_A, value)}
        onMax={() => handleMax(Field.CURRENCY_A)}
        showMaxButton={Boolean(maxAmountSpend(currencyBalances[Field.CURRENCY_A]))}
        currency={currencies[Field.CURRENCY_A]}
        id="zap-input-tokena"
        showCommonBases
        disableCurrencySelect
      />
      <ColumnCenter>
        <Plus size="16" color={theme.text2} />
      </ColumnCenter>
      <CurrencyInputPanel
        value={amounts[Field.CURRENCY_B]}
        onUserInput={(value) => handleInput(Field.CURRENCY_B, value)}
        onMax={() => handleMax(Field.CURRENCY_B)}
        showMaxButton={Boolean(maxAmountSpend(currencyBalances[Field.CURRENCY_B]))}
        currency={currencies[Field.CURRENCY_B]}
        id="zap-input-tokenb"
        showCommonBases
        disableCurrencySelect
      />

      {isRouteAvailable && !zapError && <ZapRoutePreview routeData={zapRouteData} />}

      {approvalsPending.length > 0 && isFormValid && (
        <RowBetween>
          {approvalsPending.map(({ field, approval, callback, currency }) => {
            const symbol = getTokenSymbol(currency, chainId ?? undefined)
            return (
              <ButtonPrimary
                key={field}
                onClick={callback}
                disabled={approval === ApprovalState.PENDING}
                width={approvalsPending.length > 1 ? '48%' : '100%'}
              >
                {approval === ApprovalState.PENDING ? <Dots>Approving {symbol}</Dots> : `Approve ${symbol}`}
              </ButtonPrimary>
            )
          })}
        </RowBetween>
      )}

      <ButtonError
        onClick={handleSubmit}
        disabled={!isFormValid || approvalsPending.length > 0 || isSubmitting || !zapRouteData}
        error={Boolean(zapError && userSuppliedFields.length > 0)}
      >
        {zapError ?? (isSubmitting ? <Dots>Submitting</Dots> : 'Zap & Supply')}
      </ButtonError>
    </AutoColumn>
  )
}
