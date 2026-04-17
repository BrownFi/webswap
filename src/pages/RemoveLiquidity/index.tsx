import { Currency, currencyEquals, ETHER, getPythPrice, getRouterAddress, Percent, removeLiquidity, WETH, RPC_URLS } from '@brownfi/sdk'
import { isUserRejection, parseZapError } from 'utils/zapErrors'
import { executeV3ZapOut, isV3ZapSupported, buildV3UpdateData } from 'utils/v3Zap'
import { createPublicClient, http } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { ButtonConfirmed, ButtonError, ButtonPrimary } from 'components/Button'
import { RemoveLiqudityCard } from 'components/Card'
import { AutoColumn, ColumnCenter } from 'components/Column'
import ConnectWallet from 'components/ConnectWallet'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo } from 'components/DoubleLogo'
import { Loader } from 'components/Loader'
import { AddRemoveTabs } from 'components/NavigationTabs'
import NumericInput from 'components/NumericInput'
import { MinimalInfoCard } from 'components/pool/MinimalInfoCard'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { CurrencySearchModal } from 'components/SearchModal/CurrencySearchModal'
import Slider from 'components/Slider'
import { Dots } from 'components/swap/styleds'
import { ConfirmationModalContent, TransactionConfirmationModal } from 'components/TransactionConfirmationModal'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useDebounce from 'hooks/useDebounce'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useVersion } from 'hooks/useVersion'
import { SwitchZap } from 'pages/AddLiquidity/Zap/SwitchZap'
import { isZapSupportedOnChain } from 'pages/AddLiquidity/Zap/zapHelpers'
import { ZapRoutePreview } from 'pages/AddLiquidity/Zap/ZapRoutePreview'
import { AppBody } from 'pages/AppBody'
import { MaxButton, Wrapper } from 'pages/Pool/styleds'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ArrowDown, Plus } from 'react-feather'
import { useParams } from 'react-router-dom'
import { Text } from 'components/Rebass'
import { Field } from 'state/burn/actions'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from 'state/burn/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { ThemeContext } from 'styled-components'
import { TYPE } from 'theme'
import { getTokenSymbol } from 'utils'
import { formatNumber } from 'utils/prices'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useToast } from 'containers/ToastProvider'
import { useQueryClient } from '@tanstack/react-query'
import { executeKyberZapOutTransaction, getKyberZapOutRouteData, KyberZapOutRouteData } from './zapHelpers'

export default function RemoveLiquidity() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const { createToast } = useToast()
  const queryClient = useQueryClient()
  const supportsZapV2 = useMemo(() => isZapSupportedOnChain(chainId), [chainId])
  const supportsZapV3 = useMemo(() => isV3ZapSupported(chainId, version), [chainId, version])
  const supportsZap = supportsZapV2 || supportsZapV3
  const [useZap, setUseZap] = useState(false)
  const [zapOutCurrency, setZapOutCurrency] = useState<Currency | null>(null)
  const [isZapCurrencyModalOpen, setIsZapCurrencyModalOpen] = useState(false)

  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId,
  ])

  useEffect(() => {
    if (useZap) {
      if (!zapOutCurrency) {
        setZapOutCurrency(currencyA ?? currencyB ?? null)
      }
    } else if (zapOutCurrency) {
      setZapOutCurrency(null)
    }
  }, [useZap, zapOutCurrency, currencyA, currencyB])

  useEffect(() => {
    if (!supportsZap && useZap) {
      setUseZap(false)
    }
  }, [supportsZap, useZap])

  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error: derivedError } = useDerivedBurnInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
  )
  const { onUserInput } = useBurnActionHandlers()

  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  const [txHash, setTxHash] = useState<string>('')
  const [allowedSlippage] = useUserSlippageTolerance()

  const deadline = useTransactionDeadline()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  const onLiquidityInput = useCallback((typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue), [
    onUserInput,
  ])

  const amountOut = useDebounce(parsedAmounts[Field.LIQUIDITY]?.raw.toString() ?? '0', 200)

  const zapOutQueryKey = useMemo(() => {
    if (!useZap || !supportsZap) {
      return ['zap-out-disabled']
    }

    const tokenOutAddress = zapOutCurrency
      ? wrappedCurrency(zapOutCurrency, chainId)?.address ?? zapOutCurrency.symbol ?? 'token-out'
      : 'token-out'

    return ['kyberZapOutRoute', chainId ?? 'unknown', pair?.liquidityToken.address, account, tokenOutAddress, amountOut]
  }, [useZap, supportsZap, zapOutCurrency, chainId, pair, account, amountOut])

  const isZapRouteAvailable = Boolean(
    useZap && supportsZapV2 && !supportsZapV3 && pair && chainId && account && zapOutCurrency && Number(amountOut) > 0,
  )

  const { data: zapOutRouteData, error: zapOutRouteError, isFetching: isFetchingZapOutRoute } = useQuery<
    KyberZapOutRouteData
  >({
    queryKey: zapOutQueryKey,
    queryFn: () =>
      getKyberZapOutRouteData({
        chainId: chainId!,
        pair: pair!,
        account: account!,
        tokenOut: zapOutCurrency!,
        amountOut: amountOut,
        allowedSlippage,
      }),
    enabled: isZapRouteAvailable,
    refetchInterval: 30_000,
  })

  const approvalSpender = useMemo(() => {
    if (useZap && supportsZap && zapOutRouteData?.routerAddress) {
      return zapOutRouteData.routerAddress
    }
    return chainId ? getRouterAddress(chainId, version) : undefined
  }, [useZap, supportsZap, zapOutRouteData, chainId, version])

  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], approvalSpender)

  const zapOutValidationError = useMemo(() => {
    if (!useZap || !supportsZap) return undefined
    if (!zapOutCurrency) return 'Select token'
    if (supportsZapV3) return undefined // V3 uses router contract directly, no Kyber route needed
    if (zapOutRouteError) return 'Failed to get zap route'
    if (isZapRouteAvailable && !zapOutRouteData) return 'Fetching zap route'
    return undefined
  }, [useZap, supportsZap, supportsZapV3, zapOutCurrency, zapOutRouteError, isZapRouteAvailable, zapOutRouteData])

  const combinedError = zapOutValidationError ?? derivedError
  const isValid = !combinedError

  const zapOutToken = useMemo(() => wrappedCurrency(zapOutCurrency ?? undefined, chainId), [zapOutCurrency, chainId])

  const { data: zapOutTokenPrice = 0, isFetching: isFetchingZapOutPrice } = useQuery({
    queryKey: ['getPythPrice', zapOutToken?.address],
    queryFn: () => getPythPrice(zapOutToken!.address, chainId!, version),
    enabled: Boolean(useZap && supportsZap && zapOutToken && chainId && version),
  })

  // V3 zap: fetch both token prices for USD estimates
  const { data: token0Price = 0 } = useQuery({
    queryKey: ['getPythPrice', pair?.token0.address],
    queryFn: () => getPythPrice(pair!.token0.address, chainId!, version),
    enabled: Boolean(supportsZapV3 && useZap && pair && chainId && version),
  })
  const { data: token1Price = 0 } = useQuery({
    queryKey: ['getPythPrice', pair?.token1.address],
    queryFn: () => getPythPrice(pair!.token1.address, chainId!, version),
    enabled: Boolean(supportsZapV3 && useZap && pair && chainId && version),
  })

  const isFetchingZapOutAmount = supportsZapV3 ? false : (isFetchingZapOutRoute || isFetchingZapOutPrice)

  // V3: get accurate swap estimate from router's quoteAmountsOutWithUpdate
  const { data: v3ZapOutEstimate } = useQuery({
    queryKey: ['v3ZapOutQuote', pair?.liquidityToken.address, zapOutToken?.address,
      parsedAmounts[Field.CURRENCY_A]?.toExact(), parsedAmounts[Field.CURRENCY_B]?.toExact()],
    queryFn: async () => {
      if (!pair || !zapOutToken || !chainId) return undefined
      const amount0 = Number(parsedAmounts[Field.CURRENCY_A]?.toExact() || 0)
      const amount1 = Number(parsedAmounts[Field.CURRENCY_B]?.toExact() || 0)
      if (amount0 <= 0 && amount1 <= 0) return undefined

      const isToken0Out = zapOutToken.address.toLowerCase() === pair.token0.address.toLowerCase()
      const directAmount = isToken0Out ? amount0 : amount1
      const swapAmount = isToken0Out ? amount1 : amount0
      const swapTokenIn = isToken0Out ? pair.token1.address : pair.token0.address
      const swapTokenOut = zapOutToken.address

      if (swapAmount <= 0) return directAmount

      // Use router's quoteAmountsOutWithUpdate for accurate swap estimate
      const client = createPublicClient({ transport: http(RPC_URLS[chainId]) })
      const routerAddr = getRouterAddress(chainId, version)
      const updateData = await buildV3UpdateData([swapTokenIn, swapTokenOut], chainId)

      const { result } = await client.simulateContract({
        address: routerAddr as `0x${string}`,
        abi: [{
          inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }, { name: 'updateData', type: 'bytes' }],
          name: 'quoteAmountsOutWithUpdate', outputs: [{ name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function',
        }] as const,
        functionName: 'quoteAmountsOutWithUpdate',
        args: [
          BigInt(Math.floor(swapAmount * 1e18).toString()),
          [swapTokenIn as `0x${string}`, swapTokenOut as `0x${string}`],
          updateData as `0x${string}`,
        ],
      })

      const swapOut = Number(result[result.length - 1]) / 1e18
      return directAmount + swapOut
    },
    enabled: Boolean(supportsZapV3 && useZap && pair && zapOutToken && chainId &&
      (Number(parsedAmounts[Field.CURRENCY_A]?.toExact() || 0) > 0 || Number(parsedAmounts[Field.CURRENCY_B]?.toExact() || 0) > 0)),
    staleTime: 10_000,
  })

  const zapOutEstimatedTokenAmount = useMemo(() => {
    // V3: use router quote
    if (supportsZapV3) return v3ZapOutEstimate ?? undefined

    // V2: estimate from Kyber route data
    if (!zapOutRouteData?.zapDetails?.finalAmountUsd) return undefined
    const finalUsd = Number(zapOutRouteData.zapDetails.finalAmountUsd)
    if (!Number.isFinite(finalUsd) || finalUsd <= 0) return undefined
    if (!zapOutTokenPrice || zapOutTokenPrice <= 0) return undefined
    const amount = finalUsd / zapOutTokenPrice
    return Number.isFinite(amount) && amount > 0 ? amount : undefined
  }, [zapOutRouteData, zapOutTokenPrice, supportsZapV3, v3ZapOutEstimate])

  const handleOpenZapCurrencyModal = useCallback(() => {
    setIsZapCurrencyModalOpen(true)
  }, [])

  const handleCloseZapCurrencyModal = useCallback(() => {
    setIsZapCurrencyModalOpen(false)
  }, [])

  const handleSelectZapCurrency = useCallback((currency: Currency) => {
    setZapOutCurrency(currency)
    setIsZapCurrencyModalOpen(false)
  }, [])

  async function onRemove() {
    try {
      if (!chainId || !library || !account) {
        throw new Error('missing dependencies')
      }

      setAttemptingTxn(true)
      if (useZap && version === 3 && supportsZapV3 && zapOutCurrency) {
        const tokenOut = wrappedCurrency(zapOutCurrency, chainId)
        if (!tokenOut) throw new Error('Invalid output token')
        const isNativeETH = zapOutCurrency === ETHER
        const response = await executeV3ZapOut({
          chainId,
          library,
          account,
          tokenA: pair!.token0.address,
          tokenB: pair!.token1.address,
          tokenOut: tokenOut.address,
          liquidity: parsedAmounts[Field.LIQUIDITY]!.raw.toString(),
          amountMin: '0', // TODO: calculate from reserves + slippage
          deadline: deadline as any,
          isNativeETH,
        })

        setAttemptingTxn(false)
        if (response) {
          setTxHash(response.hash)
        }
      } else if (useZap && supportsZap) {
        if (!zapOutRouteData) {
          throw new Error('Zap route unavailable')
        }

        const response = await executeKyberZapOutTransaction({
          chainId,
          account,
          routeData: zapOutRouteData,
          library,
        })

        setAttemptingTxn(false)
        if (response) {
          setTxHash(response.hash)
        }
      } else {
        const response = await removeLiquidity(
          chainId,
          library as any,
          account,
          parsedAmounts,
          deadline as any,
          allowedSlippage,
          approval,
          null, // signatureData, @deprecated
          version,
        )

        setAttemptingTxn(false)
        if (response) {
          setTxHash(response.hash)
          setTimeout(() => queryClient.invalidateQueries(), 5000)
        }
      }
    } catch (e: any) {
      setAttemptingTxn(false)
      if (isUserRejection(e)) return
      console.error('Remove liquidity failed:', e)
      createToast(useZap ? parseZapError(e) : (e?.reason || e?.message || 'Remove liquidity failed. Please try again.'), 'error')
    }
  }

  function modalHeader() {
    if (useZap && zapOutCurrency) {
      return (
        <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
          <RowBetween align="flex-end">
            <Text fontSize={24} fontWeight={500} color={'white'}>
              {formatNumber(zapOutEstimatedTokenAmount, { maximumFractionDigits: 2 })}
            </Text>
            <RowFixed gap="4px">
              <CurrencyLogo currency={zapOutCurrency} size={'24px'} />
              <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }} color={'white'}>
                {zapOutSymbol ?? getTokenSymbol(zapOutCurrency, chainId)}
              </Text>
            </RowFixed>
          </RowBetween>

          <TYPE.italic fontSize={12} color={theme.white} textAlign="left" padding={'12px 0 0 0'} opacity={0.5}>
            {`Output token is estimated. Zap out execution will attempt to convert withdrawn liquidity into ${zapOutSymbol ??
              getTokenSymbol(zapOutCurrency, chainId)}.`}
          </TYPE.italic>
        </AutoColumn>
      )
    }

    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <AutoColumn gap="4px">
          <RowBetween align="flex-end">
            <Text fontSize={24} fontWeight={500} color={'white'}>
              {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
            </Text>
            <RowFixed gap="4px">
              <CurrencyLogo currency={currencyA} size={'24px'} />
              <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }} color={'white'}>
                {getTokenSymbol(currencyA, chainId)}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowFixed>
            <Plus size="16" color={theme.white} />
          </RowFixed>
          <RowBetween align="flex-end">
            <Text fontSize={24} fontWeight={500} color={'white'}>
              {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
            </Text>
            <RowFixed gap="4px">
              <CurrencyLogo currency={currencyB} size={'24px'} />
              <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }} color={'white'}>
                {getTokenSymbol(currencyB, chainId)}
              </Text>
            </RowFixed>
          </RowBetween>
        </AutoColumn>

        <TYPE.italic fontSize={12} color={theme.white} textAlign="left" padding={'12px 0 0 0'} opacity={0.5}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </TYPE.italic>
      </AutoColumn>
    )
  }

  function modalBottom() {
    return (
      <>
        <RowBetween>
          <Text color={theme.white} fontWeight={500} fontSize={16} opacity={0.5}>
            {getTokenSymbol(currencyA, chainId) + '/' + getTokenSymbol(currencyB, chainId)} Burned
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />
            <Text fontWeight={500} fontSize={16} color={'white'}>
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
            <RowBetween>
              <Text color={theme.white} fontWeight={500} fontSize={16} opacity={0.5}>
                Price
              </Text>
              <Text fontWeight={500} fontSize={16} color={theme.white}>
                1 {getTokenSymbol(currencyA, chainId)} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
                {getTokenSymbol(currencyB, chainId)}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text fontWeight={500} fontSize={16} color={theme.white}>
                1 {getTokenSymbol(currencyB, chainId)} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
                {getTokenSymbol(currencyA, chainId)}
              </Text>
            </RowBetween>
          </>
        )}
        <ButtonPrimary onClick={onRemove}>
          <Text fontWeight={500} fontSize={20}>
            Confirm
          </Text>
        </ButtonPrimary>
      </>
    )
  }

  const zapOutSymbol = useMemo(() => getTokenSymbol(zapOutCurrency, chainId), [zapOutCurrency, chainId])

  const pendingText =
    useZap && zapOutSymbol
      ? `Removing liquidity into ${zapOutSymbol}`
      : `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}` +
        ` ${getTokenSymbol(currencyA, chainId)} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}` +
        ` ${getTokenSymbol(currencyB, chainId)}`

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput],
  )
  const innerLiquidityPercentage = Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0))

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
        (currencyB && currencyEquals(WETH[chainId], currencyB))),
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  return (
    <>
      <AppBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <AddRemoveTabs creating={false} adding={false} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContent
                title={'You will receive'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="20px">
            <RemoveLiqudityCard>
              <AutoColumn gap="20px">
                <Text fontWeight={500} color={'white'} fontSize={isMobile ? 16 : 18} fontFamily={'Inter'}>
                  Amount
                </Text>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <NumericInput
                    value={innerLiquidityPercentage}
                    onChange={(val) => {
                      onUserInput(Field.LIQUIDITY_PERCENT, val === '' ? '0' : (val as string))
                    }}
                    decimalScale={0}
                    min={0}
                    max={100}
                    suffix="%"
                    style={{ fontSize: 32, fontWeight: 600 }}
                  />

                  <div className="flex items-center gap-2 sm:gap-3">
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} width="auto">
                      25%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} width="auto">
                      50%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')} width="auto">
                      75%
                    </MaxButton>
                    <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')} width="auto">
                      Max
                    </MaxButton>
                  </div>
                </div>

                <Slider value={innerLiquidityPercentage} onChange={liquidityPercentChangeCallback} />
              </AutoColumn>
            </RemoveLiqudityCard>

            <CurrencyInputPanel
              customBalanceText="Your LP tokens: "
              value={formattedAmounts[Field.LIQUIDITY]}
              onUserInput={onLiquidityInput}
              onMax={() => {
                onUserInput(Field.LIQUIDITY_PERCENT, '100')
              }}
              showMaxButton={!atMaxAmount}
              disableCurrencySelect
              currency={pair?.liquidityToken}
              pair={pair}
              id="liquidity-amount"
            />

            <ColumnCenter>
              <ArrowDown size="20" color="#fff" />
            </ColumnCenter>

            <RemoveLiqudityCard>
              <AutoColumn gap="20px">
                <div className="flex flex-wrap justify-between gap-3">
                  <Text fontWeight={500} color={'white'} fontSize={isMobile ? 16 : 18} fontFamily={'Inter'}>
                    Receive
                  </Text>

                  <SwitchZap
                    enabled={useZap}
                    version={version}
                    onToggle={() => {
                      setUseZap((prev) => !prev)
                    }}
                  />
                </div>

                {useZap && supportsZap ? (
                  <AutoColumn gap="16px">
                    <button
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-2 min-h-12 bg-[#120F0D] border border-[#2F2823] hover:bg-[#2F2823] rounded-xl"
                      onClick={handleOpenZapCurrencyModal}
                    >
                      {zapOutCurrency ? (
                        <>
                          {isFetchingZapOutAmount ? (
                            <Loader stroke="gray" />
                          ) : (
                            <Text fontSize={20} color="white" fontWeight={600}>
                              {zapOutEstimatedTokenAmount
                                ? formatNumber(zapOutEstimatedTokenAmount, { maximumFractionDigits: 2 })
                                : '-'}
                            </Text>
                          )}

                          <div className="flex items-center gap-2">
                            <CurrencyLogo currency={zapOutCurrency} size={'24px'} />
                            <Text color="white" fontWeight={600}>
                              {zapOutSymbol ?? getTokenSymbol(zapOutCurrency, chainId)}
                            </Text>
                          </div>
                        </>
                      ) : (
                        <span className="text-base font-semibold text-white/60">Select token</span>
                      )}
                    </button>
                    {supportsZapV3 && zapOutEstimatedTokenAmount ? (() => {
                      const initUsd = Number(parsedAmounts[Field.CURRENCY_A]?.toExact() || 0) * token0Price +
                                      Number(parsedAmounts[Field.CURRENCY_B]?.toExact() || 0) * token1Price
                      const estUsd = zapOutEstimatedTokenAmount * zapOutTokenPrice
                      const impact = initUsd > 0 ? Math.abs((estUsd - initUsd) / initUsd * 100) : 0
                      return (
                        <div className="flex flex-col gap-1 text-sm text-white/60 px-1">
                          <div className="flex justify-between">
                            <span>Initial value (USD)</span>
                            <span className="text-white">${formatNumber(initUsd, { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimated value after zap</span>
                            <span className="text-white">${formatNumber(estUsd, { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price impact</span>
                            <span className="text-[#c4943a]">{impact < 0.01 ? '< 0.01%' : formatNumber(impact, { maximumFractionDigits: 2 }) + '%'}</span>
                          </div>
                        </div>
                      )
                    })() : !supportsZapV3 ? (
                      <ZapRoutePreview routeData={zapOutRouteData} />
                    ) : null}
                  </AutoColumn>
                ) : (
                  <AutoColumn gap="10px">
                    <RowBetween>
                      <Text fontSize={24} fontWeight={500} color={'white'}>
                        {formattedAmounts[Field.CURRENCY_A] || '-'}
                      </Text>
                      <RowFixed>
                        <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} />
                        <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokena-symbol" color={'white'}>
                          {getTokenSymbol(currencyA, chainId)}
                        </Text>
                      </RowFixed>
                    </RowBetween>
                    <RowBetween>
                      <Text fontSize={24} fontWeight={500} color={'white'}>
                        {formattedAmounts[Field.CURRENCY_B] || '-'}
                      </Text>
                      <RowFixed>
                        <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} />
                        <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokenb-symbol" color={'white'}>
                          {getTokenSymbol(currencyB, chainId)}
                        </Text>
                      </RowFixed>
                    </RowBetween>
                  </AutoColumn>
                )}
              </AutoColumn>
            </RemoveLiqudityCard>

            {pair && (
              <div style={{ display: 'none', padding: '10px 20px', color: 'white' }}>
                <RowBetween>
                  Price:
                  <div>
                    1 {getTokenSymbol(currencyA, chainId)} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
                    {getTokenSymbol(currencyB, chainId)}
                  </div>
                </RowBetween>
                <RowBetween>
                  <div />
                  <div>
                    1 {getTokenSymbol(currencyB, chainId)} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
                    {getTokenSymbol(currencyA, chainId)}
                  </div>
                </RowBetween>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              {!account ? (
                <ConnectWallet />
              ) : (
                <RowBetween style={{ gap: '16px' }}>
                  <ButtonConfirmed
                    onClick={approveCallback}
                    confirmed={approval === ApprovalState.APPROVED}
                    disabled={approval !== ApprovalState.NOT_APPROVED}
                    fontWeight={500}
                    fontSize={16}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <Dots>Approving</Dots>
                    ) : approval === ApprovalState.APPROVED ? (
                      'Approved'
                    ) : (
                      'Approve'
                    )}
                  </ButtonConfirmed>

                  <ButtonError
                    onClick={() => {
                      setShowConfirm(true)
                    }}
                    disabled={!isValid || approval !== ApprovalState.APPROVED}
                    error={!isValid}
                    fontWeight={500}
                    fontSize={16}
                  >
                    {combinedError ? (
                      combinedError === 'Fetching zap route' ? (
                        <Dots>Loading</Dots>
                      ) : (
                        combinedError
                      )
                    ) : (
                      'Remove'
                    )}
                  </ButtonError>
                </RowBetween>
              )}
            </div>
          </AutoColumn>
        </Wrapper>
        {pair && (
          <MinimalInfoCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
        )}
        </div>
      </AppBody>

      <CurrencySearchModal
        isOpen={isZapCurrencyModalOpen}
        onDismiss={handleCloseZapCurrencyModal}
        onCurrencySelect={handleSelectZapCurrency}
        selectedCurrency={zapOutCurrency ?? undefined}
        showCommonBases
      />
    </>
  )
}
