import { Currency, Pair } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { ButtonError, ButtonPrimary, ButtonSecondary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { CurrencySearchModal } from 'components/SearchModal/CurrencySearchModal'
import { Dots } from 'components/swap/styleds'
import { useToast } from 'containers/ToastProvider'
import { PairState } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'react-feather'
import { Field } from 'state/mint/actions'
import { tryParseAmount } from 'state/swap/hooks'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { ThemeContext } from 'styled-components'
import { getTokenSymbol } from 'utils'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import {
  executeKyberZapTransaction,
  getKyberZapRouteData,
  isZapSupportedOnChain,
  KyberZapRouteData,
} from './zapHelpers'
import ZapTokenInputRow, { ParsedZapInput, ZapInput } from './ZapInput'
import { ZapRoutePreview } from './ZapRoutePreview'

type ZapApprovalInfo = {
  approval: ApprovalState
  approve: () => Promise<void>
  currency: Currency | null
  requiresApproval: boolean
}

type ZapFormProps = {
  pair?: Pair
  pairState: PairState
  currencies: { [field in Field]?: Currency }
  allowedSlippage: number
}

export function ZapForm({ pair, pairState, currencies, allowedSlippage }: ZapFormProps) {
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const { createToast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const idRef = useRef(0)
  const previousPairAddress = useRef<string | undefined>()

  const createInput = useCallback(
    (currency?: Currency | null): ZapInput => ({
      id: `zap-${idRef.current++}`,
      currency: currency ?? null,
      amount: '',
    }),
    [],
  )

  const buildDefaultInputs = useCallback(() => {
    const baseCurrencies = [
      currencies[Field.CURRENCY_A],
      currencies[Field.CURRENCY_B],
    ].filter((currency): currency is Currency => Boolean(currency))

    const defaults = baseCurrencies.map((currency) => createInput(currency))
    while (defaults.length < 2) {
      defaults.push(createInput(null))
    }
    return defaults
  }, [currencies, createInput])

  const [inputs, setInputs] = useState<ZapInput[]>(() => buildDefaultInputs())
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false)

  useEffect(() => {
    const pairAddress = pair?.liquidityToken.address

    if (pairAddress && pairAddress !== previousPairAddress.current) {
      previousPairAddress.current = pairAddress
      setInputs(buildDefaultInputs())
    } else if (!pairAddress && previousPairAddress.current) {
      previousPairAddress.current = undefined
      setInputs(buildDefaultInputs())
    }
  }, [pair, buildDefaultInputs])

  const parsedInputs: ParsedZapInput[] = useMemo(
    () =>
      inputs.map((input) => ({
        ...input,
        parsedAmount: input.currency ? tryParseAmount(input.amount, input.currency) ?? undefined : undefined,
      })),
    [inputs],
  )

  const currencyList = useMemo(() => inputs.map((input) => input.currency ?? undefined), [inputs])
  const balances = useCurrencyBalances(account ?? undefined, currencyList)

  const validInputs = useMemo(
    () => parsedInputs.filter((input) => !!(input.currency && input.parsedAmount?.greaterThan('0'))),
    [parsedInputs],
  )
  const validInputIds = useMemo(() => new Set(validInputs.map((input) => input.id)), [validInputs])

  const supportsZap = useMemo(() => isZapSupportedOnChain(chainId), [chainId])

  const isRouteAvailable = Boolean(
    supportsZap && pair && pairState === PairState.EXISTS && chainId && account && validInputs.length > 0,
  )

  const routeQueryKey = useMemo(() => {
    const amountKey = validInputs.map((input) => {
      const address =
        wrappedCurrency(input.currency ?? undefined, chainId ?? undefined)?.address ??
        input.currency?.symbol ??
        `native-${input.id}`
      return `${address}:${input.parsedAmount?.raw.toString() ?? '0'}`
    })
    return ['kyberZapRoute', chainId, pair?.liquidityToken.address, account, allowedSlippage, amountKey]
  }, [chainId, pair, account, allowedSlippage, validInputs])

  const routeInputs = useMemo(
    () =>
      validInputs.map((input) => ({
        currency: input.currency!,
        amount: input.parsedAmount!,
      })),
    [validInputs],
  )

  const { data: zapRouteData, error: zapRouteError } = useQuery<KyberZapRouteData>({
    queryKey: routeQueryKey,
    queryFn: () =>
      getKyberZapRouteData({
        chainId: chainId!,
        pair: pair!,
        account: account!,
        allowedSlippage,
        inputs: routeInputs,
      }),
    enabled: isRouteAvailable,
    refetchInterval: 10_000,
  })

  const zapError = useMemo(() => {
    if (!supportsZap) return 'Zap not supported on this network'
    if (!pair || pairState !== PairState.EXISTS) return 'Pool unavailable for zap'
    if (!chainId || !account || !library) return 'Connect Wallet'
    if (validInputs.length === 0) return 'Enter an amount'
    if (zapRouteError) return 'Failed to get zap routes'

    for (let i = 0; i < parsedInputs.length; i++) {
      const input = parsedInputs[i]
      const balance = balances[i]
      if (input.currency && input.parsedAmount && balance && balance.lessThan(input.parsedAmount)) {
        const symbol = getTokenSymbol(input.currency, chainId ?? undefined)
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
    validInputs.length,
    zapRouteError,
    parsedInputs,
    balances,
  ])
  const isFormValid = !zapError

  const [approvalInfoMap, setApprovalInfoMap] = useState<Record<string, ZapApprovalInfo>>({})

  useEffect(() => {
    setApprovalInfoMap((prev) => {
      const next: Record<string, ZapApprovalInfo> = {}
      let changed = false

      for (const input of inputs) {
        if (prev[input.id]) {
          next[input.id] = prev[input.id]
        } else {
          changed = true
        }
      }

      if (!changed && Object.keys(prev).length === Object.keys(next).length) {
        return prev
      }

      return next
    })
  }, [inputs])

  const handleApprovalInfoChange = useCallback((id: string, info: ZapApprovalInfo | undefined) => {
    setApprovalInfoMap((prev) => {
      if (!info) {
        if (!(id in prev)) {
          return prev
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = prev
        return rest
      }

      const previous = prev[id]
      if (
        previous &&
        previous.approval === info.approval &&
        previous.approve === info.approve &&
        previous.currency === info.currency &&
        previous.requiresApproval === info.requiresApproval
      ) {
        return prev
      }

      return {
        ...prev,
        [id]: info,
      }
    })
  }, [])

  const approvalsPending = useMemo(() => {
    return validInputs
      .map((input) => {
        const info = approvalInfoMap[input.id]
        if (!info || !info.requiresApproval) {
          return undefined
        }
        if (info.approval === ApprovalState.APPROVED) {
          return undefined
        }
        return {
          id: input.id,
          ...info,
        }
      })
      .filter((entry): entry is { id: string } & ZapApprovalInfo => Boolean(entry))
  }, [validInputs, approvalInfoMap])

  const handleAmountChange = useCallback((id: string, value: string) => {
    setInputs((prev) => prev.map((input) => (input.id === id ? { ...input, amount: value } : input)))
  }, [])

  const handleCurrencySelect = useCallback((id: string, currency: Currency) => {
    setInputs((prev) => prev.map((input) => (input.id === id ? { ...input, currency } : input)))
  }, [])

  const handleMax = useCallback(
    (id: string) => {
      setInputs((prev) =>
        prev.map((input, index) => {
          if (input.id !== id) {
            return input
          }
          const max = maxAmountSpend(balances[index])
          return {
            ...input,
            amount: max?.toExact() ?? '',
          }
        }),
      )
    },
    [balances],
  )

  const handleRemove = useCallback((id: string) => {
    setInputs((prev) => (prev.length > 1 ? prev.filter((input) => input.id !== id) : prev))
  }, [])

  const handleAddInput = useCallback(() => {
    setIsAddTokenOpen(true)
  }, [])

  const handleAddTokenDismiss = useCallback(() => {
    setIsAddTokenOpen(false)
  }, [])

  const handleTokenSelect = useCallback(
    (currency: Currency) => {
      setInputs((prev) => [...prev, createInput(currency)])
      setIsAddTokenOpen(false)
    },
    [createInput],
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

      setInputs((prev) => prev.map((input) => ({ ...input, amount: '' })))
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
      <AutoColumn gap="24px">
        {parsedInputs.map((input, index) => {
          return (
            <ZapTokenInputRow
              key={input.id}
              input={input}
              index={index}
              onAmountChange={(value) => handleAmountChange(input.id, value)}
              onCurrencySelect={(currency) => handleCurrencySelect(input.id, currency)}
              onRemove={() => handleRemove(input.id)}
              onMax={() => handleMax(input.id)}
              canRemove={parsedInputs.length > 1}
              routerAddress={zapRouteData?.routerAddress}
              onApprovalInfoChange={handleApprovalInfoChange}
            />
          )
        })}
      </AutoColumn>

      <ButtonSecondary
        width="fit-content"
        className="hover:bg-black/80 !rounded-full !py-1 !pl-2 !pr-3"
        onClick={handleAddInput}
      >
        <Plus size={16} color={theme.white} style={{ marginRight: '8px' }} />
        Add token
      </ButtonSecondary>

      {isRouteAvailable && !zapError && <ZapRoutePreview routeData={zapRouteData} />}

      {approvalsPending.length > 0 && isFormValid && (
        <RowBetween>
          {approvalsPending.map(({ id, approval, approve, currency }) => {
            const symbol = getTokenSymbol(currency, chainId ?? undefined)
            return (
              <ButtonPrimary
                key={id}
                onClick={approve}
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
        error={Boolean(zapError && validInputIds.size > 0)}
      >
        {zapError ?? (isSubmitting ? <Dots>Submitting</Dots> : 'Zap & Supply')}
      </ButtonError>

      <CurrencySearchModal
        isOpen={isAddTokenOpen}
        onDismiss={handleAddTokenDismiss}
        onCurrencySelect={handleTokenSelect}
        showCommonBases
      />
    </AutoColumn>
  )
}
