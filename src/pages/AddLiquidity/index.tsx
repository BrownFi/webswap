import { addLiquidity, Currency, currencyEquals, getRouterAddress, TokenAmount, WETH } from '@brownfi/sdk'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import { AutoColumn, ColumnCenter } from 'components/Column'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { DoubleCurrencyLogo, DoubleCurrencySymbol } from 'components/DoubleLogo'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { MinimalInfoCard } from 'components/pool/MinimalInfoCard'
import Row, { RowBetween, RowFlat } from 'components/Row'
import { ConfirmationModalContent, TransactionConfirmationModal } from 'components/TransactionConfirmationModal'
import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'react-feather'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Text } from 'components/Rebass'

import { PairState } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { Field } from 'state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'

import ConnectWallet from 'components/ConnectWallet'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { useToast } from 'containers/ToastProvider'
import { useQueryClient } from '@tanstack/react-query'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
import { decodeContractError } from 'utils/decodeContractError'
import { isUserRejection } from 'utils/zapErrors'
import { AppBody } from 'pages/AppBody'
import { Dots, Wrapper } from 'pages/Pool/styleds'
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks'
import { TYPE } from 'theme'
import { getTokenSymbol } from 'utils'
import { currencyId } from 'utils/currencyId'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { ConfirmAddModalBottom } from './ConfirmAddModalBottom'
import { PoolPriceBar } from './PoolPriceBar'
import { SwitchZap } from './Zap/SwitchZap'
import { getApprovalBuffer } from './utils'
import { ZapForm } from './Zap/ZapForm'
import { V3ZapForm } from './Zap/V3ZapForm'
import { unwrappedToken } from 'utils/wrappedCurrency'

export default function AddLiquidity() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA?: string; currencyIdB?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { account, chainId, library } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  const { createToast } = useToast()
  const queryClient = useQueryClient()
  const addTransaction = useTransactionAdder()

  const [useZap, setUseZap] = useState(false)

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const pythPrices = usePythPrices({ currencyA, currencyB, chainId })
  const hasPythPrices = pythPrices.CURRENCY_A + pythPrices.CURRENCY_B > 0

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WETH[chainId])) ||
        (currencyB && currencyEquals(currencyB, WETH[chainId]))),
  )

  const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    requiresPoolCreation,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined, version >= 2 ? pythPrices : undefined)

  const dependentAmount = (+typedValue * pythPrices[independentField]) / pythPrices[dependentField] || 0

  const formattedPythAmounts = {
    [independentField]: typedValue,
    [dependentField]:
      noLiquidity && !hasPythPrices ? otherTypedValue : dependentAmount === 0 ? '' : dependentAmount.toPrecision(6),
  }

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  const [exactFieldInput, setExactFieldInput] = useState<Field | undefined>(undefined)

  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]:
      noLiquidity && !hasPythPrices
        ? otherTypedValue
        : version === 2
        ? formattedPythAmounts[dependentField]
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {},
  )

  const parsedAmountAForApproval = parsedAmounts[Field.CURRENCY_A]
  const parsedAmountBForApproval = parsedAmounts[Field.CURRENCY_B]
  const approvalAmountA = useMemo(() => getApprovalBuffer(parsedAmountAForApproval), [parsedAmountAForApproval])
  const approvalAmountB = useMemo(() => getApprovalBuffer(parsedAmountBForApproval), [parsedAmountBForApproval])

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(approvalAmountA, getRouterAddress(chainId || 0, version))
  const [approvalB, approveBCallback] = useApproveCallback(approvalAmountB, getRouterAddress(chainId || 0, version))

  async function onAdd() {
    try {
      const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
      setAttemptingTxn(true)
      const response = await addLiquidity(
        chainId,
        library as any,
        account as string,
        parsedAmountA,
        parsedAmountB,
        exactFieldInput,
        deadline as any,
        // Pass `requiresPoolCreation` (factory has no pair) rather than
        // `noLiquidity` (pool exists but empty) so the SDK only zeroes out
        // slippage when the V2 router will actually run the first-mint
        // path. V3 empty pools still go through Pyth-driven amount
        // recomputation, and zero slippage there reverts `InsufficientBAmount`
        // on harmless integer-precision deltas between FE and router.
        requiresPoolCreation ?? false,
        allowedSlippage,
        version,
      )

      if (response) {
        setAttemptingTxn(false)
        setTxHash(response.hash)
        addTransaction(response, {
          summary: `Add ${parsedAmountA?.toSignificant(3)} ${getTokenSymbol(currencies[Field.CURRENCY_A], chainId)} and ${parsedAmountB?.toSignificant(3)} ${getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}`,
        })
        setTimeout(() => queryClient.invalidateQueries(), 5000)
      }
    } catch (error) {
      setAttemptingTxn(false)
      if (isUserRejection(error)) return
      console.error(error)
      const msg = decodeContractError(error, 'Add liquidity failed. Please try again.')
      if (msg) createToast(msg, 'error')
    }
  }

  const modalHeader = () => {
    // Show the "you are initializing this pair" card only when the user is
    // actually deploying the pool contract (V2 first-mint). V3 empty pools
    // are EXISTS-but-zero-supply and should go through the normal "you will
    // receive N LP tokens" header instead.
    return requiresPoolCreation ? (
      <AutoColumn gap="20px">
        <LightCard borderRadius="16px" style={{ marginTop: '20px' }}>
          <RowFlat className="px-2">
            <Text fontSize="36px" fontWeight={600} lineHeight="42px" marginRight={10} color="white">
              {getTokenSymbol(currencies[Field.CURRENCY_A], chainId) +
                '/' +
                getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: '20px' }}>
          <span style={{ fontFamily: 'Inter', fontSize: '48px', fontWeight: 600, lineHeight: '42px', marginRight: '10px', color: '#FBFBFD' }}>
            {liquidityMinted?.toSignificant(6)}
          </span>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat>
        <Row>
          <span style={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: 600, color: '#FBFBFD' }}>
            {getTokenSymbol(currencies[Field.CURRENCY_A], chainId) +
              '/' +
              getTokenSymbol(currencies[Field.CURRENCY_B], chainId) +
              ' Pool Tokens'}
          </span>
        </Row>
        <span style={{ fontFamily: 'Inter', fontSize: '12px', fontStyle: 'italic', color: '#978A80', textAlign: 'left', padding: '8px 0 0 0' }}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </span>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        // `noLiquidity` (zero-supply pool, including V3 pre-deployed) still
        // drives the "Share of Pool: 100%" first-LP display. The button label,
        // however, follows `requiresPoolCreation` so users on a V3 empty pool
        // see "Confirm Supply" rather than "Create Pool & Supply".
        noLiquidity={noLiquidity}
        requiresPoolCreation={requiresPoolCreation}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${getTokenSymbol(
    currencies[Field.CURRENCY_A],
    chainId,
  )} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}`
  const submittedText = `Supplied ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${getTokenSymbol(
    currencies[Field.CURRENCY_A],
    chainId,
  )} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}`

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA)
      if (newCurrencyIdA === currencyIdB) {
        navigate(`/add/${currencyIdB}/${currencyIdA}`)
      } else {
        navigate(`/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, navigate, currencyIdA],
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          navigate(`/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          navigate(`/add/${newCurrencyIdB}`)
        }
      } else {
        navigate(`/add/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, navigate, currencyIdB],
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const isCreate = location.pathname.includes('/create')

  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const currency0 = pair ? unwrappedToken(pair.token0) : undefined
  const currency1 = pair ? unwrappedToken(pair.token1) : undefined

  return (
    <>
      <AppBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <AddRemoveTabs creating={isCreate} adding={true} />

        <div className="flex flex-wrap justify-between items-center" style={{ padding: '0', gap: '16px' }}>
          {pair ? (
            <div className="flex items-center gap-3">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} margin />
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#FBFBFD' }}>
                <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
              </span>
            </div>
          ) : pairState === PairState.LOADING ? (
            <div className="flex items-center gap-3">
              {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && (
                <DoubleCurrencyLogo currency0={currencies[Field.CURRENCY_A]} currency1={currencies[Field.CURRENCY_B]} size={24} margin />
              )}
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#978A80' }}>
                {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] ? (
                  <DoubleCurrencySymbol currency0={currencies[Field.CURRENCY_A]} currency1={currencies[Field.CURRENCY_B]} />
                ) : (
                  'Loading pool...'
                )}
              </span>
            </div>
          ) : pairState === PairState.NOT_EXISTS && currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] ? (
            <div className="flex items-center gap-3">
              <DoubleCurrencyLogo currency0={currencies[Field.CURRENCY_A]} currency1={currencies[Field.CURRENCY_B]} size={24} margin />
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#FBFBFD' }}>
                <DoubleCurrencySymbol currency0={currencies[Field.CURRENCY_A]} currency1={currencies[Field.CURRENCY_B]} />
              </span>
            </div>
          ) : (
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', color: '#978A80' }}>
              - Invalid Pool -
            </span>
          )}
          <div className="ml-auto">
            <SwitchZap enabled={useZap} onToggle={() => setUseZap((prev) => !prev)} version={version} />
          </div>
        </div>

        {useZap && version === 3 && pair ? (
          <Wrapper>
            <V3ZapForm pair={pair} pairState={pairState} currencies={currencies} allowedSlippage={allowedSlippage} />
          </Wrapper>
        ) : useZap && pair ? (
          <Wrapper>
            <ZapForm pair={pair} pairState={pairState} currencies={currencies} allowedSlippage={allowedSlippage} />
          </Wrapper>
        ) : (
          <Wrapper>
            <TransactionConfirmationModal
              isOpen={showConfirm}
              onDismiss={handleDismissConfirmation}
              attemptingTxn={attemptingTxn}
              hash={txHash}
              content={() => (
                <ConfirmationModalContent
                  title={requiresPoolCreation ? 'You are creating a pool' : 'You will receive'}
                  onDismiss={handleDismissConfirmation}
                  topContent={modalHeader}
                  bottomContent={modalBottom}
                />
              )}
              pendingText={pendingText}
              submittedText={submittedText}
              currencyToAdd={pair?.liquidityToken}
            />
            <AutoColumn gap="20px">
              <CurrencyInputPanel
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={(value) => {
                  onFieldAInput(value)
                  setExactFieldInput(Field.CURRENCY_A)
                }}
                onMax={() => {
                  onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                  setExactFieldInput(Field.CURRENCY_A)
                }}
                onCurrencySelect={handleCurrencyASelect}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                currency={currencies[Field.CURRENCY_A]}
                id="add-liquidity-input-tokena"
                showCommonBases
              />
              <ColumnCenter>
                <Plus size="24" color="#fff" />
              </ColumnCenter>
              <CurrencyInputPanel
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={(value) => {
                  onFieldBInput(value)
                  setExactFieldInput(Field.CURRENCY_B)
                }}
                onCurrencySelect={handleCurrencyBSelect}
                onMax={() => {
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                  setExactFieldInput(Field.CURRENCY_B)
                }}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                currency={currencies[Field.CURRENCY_B]}
                id="add-liquidity-input-tokenb"
                showCommonBases
              />
              {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
                <div>
                  <PoolPriceBar
                    currencies={currencies}
                    poolTokenPercentage={poolTokenPercentage}
                    noLiquidity={noLiquidity}
                    price={price}
                  />
                </div>
              )}

              {addIsUnsupported ? (
                <ButtonPrimary disabled={true}>
                  <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
                </ButtonPrimary>
              ) : !account ? (
                <ConnectWallet />
              ) : (
                <AutoColumn gap={'md'}>
                  {(approvalA === ApprovalState.NOT_APPROVED ||
                    approvalA === ApprovalState.PENDING ||
                    approvalB === ApprovalState.NOT_APPROVED ||
                    approvalB === ApprovalState.PENDING) &&
                    isValid && (
                      <RowBetween>
                        {approvalA !== ApprovalState.APPROVED && (
                          <ButtonPrimary
                            onClick={approveACallback}
                            disabled={approvalA === ApprovalState.PENDING}
                            width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                          >
                            {approvalA === ApprovalState.PENDING ? (
                              <Dots>Approving {getTokenSymbol(currencies[Field.CURRENCY_A], chainId)}</Dots>
                            ) : (
                              'Approve ' + getTokenSymbol(currencies[Field.CURRENCY_A], chainId)
                            )}
                          </ButtonPrimary>
                        )}
                        {approvalB !== ApprovalState.APPROVED && (
                          <ButtonPrimary
                            onClick={approveBCallback}
                            disabled={approvalB === ApprovalState.PENDING}
                            width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                          >
                            {approvalB === ApprovalState.PENDING ? (
                              <Dots>Approving {getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}</Dots>
                            ) : (
                              'Approve ' + getTokenSymbol(currencies[Field.CURRENCY_B], chainId)
                            )}
                          </ButtonPrimary>
                        )}
                      </RowBetween>
                    )}
                  <ButtonError
                    onClick={() => {
                      expertMode ? onAdd() : setShowConfirm(true)
                    }}
                    disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                    error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                  >
                    {error ?? 'Supply'}
                  </ButtonError>
                </AutoColumn>
              )}
            </AutoColumn>
          </Wrapper>
        )}

        {!addIsUnsupported ? (
          pair && !noLiquidity && pairState !== PairState.INVALID ? (
            <MinimalInfoCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
          ) : null
        ) : (
          <UnsupportedCurrencyFooter
            show={addIsUnsupported}
            currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
          />
        )}
        </div>
      </AppBody>
    </>
  )
}
