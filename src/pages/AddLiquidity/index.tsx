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
import { useCallback, useContext, useMemo, useState } from 'react'
import { Plus } from 'react-feather'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'

import { PairState } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { Field } from 'state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks'

import ConnectWallet from 'components/ConnectWallet'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { useToast } from 'containers/ToastProvider'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
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
import { unwrappedToken } from 'utils/wrappedCurrency'

export default function AddLiquidity() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA?: string; currencyIdB?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  const { createToast } = useToast()

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
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined, version === 2 ? pythPrices : undefined)

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
        account,
        parsedAmountA,
        parsedAmountB,
        exactFieldInput,
        deadline as any,
        noLiquidity,
        allowedSlippage,
        version,
      )

      if (response) {
        setAttemptingTxn(false)
        setTxHash(response.hash)
      }
    } catch (error) {
      setAttemptingTxn(false)
      if ((error as any)?.code !== 4001) {
        console.error(error)
      }
      if (typeof (error as any)?.reason === 'string') {
        createToast((error as any)?.reason, 'error')
      }
    }
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" borderRadius="16px">
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
          <Text fontSize="48px" fontWeight={600} lineHeight="42px" marginRight={10} color="white">
            {liquidityMinted?.toSignificant(6)}
          </Text>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat>
        <Row>
          <Text fontSize="24px" color={'white'}>
            {getTokenSymbol(currencies[Field.CURRENCY_A], chainId) +
              '/' +
              getTokenSymbol(currencies[Field.CURRENCY_B], chainId) +
              ' Pool Tokens'}
          </Text>
        </Row>
        <TYPE.italic fontSize={12} textAlign="left" padding={'8px 0 0 0 '} color={'white'} opacity={0.5}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </TYPE.italic>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${getTokenSymbol(
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
        <AddRemoveTabs creating={isCreate} adding={true} />

        <div className="flex flex-wrap justify-between mb-8 mt-2 px-8 gap-3">
          {pair ? (
            <div className="flex items-center gap-2 px-2">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
              <Text fontWeight={700} fontSize={20} className="text-white">
                <DoubleCurrencySymbol currency0={currency0} currency1={currency1} />
              </Text>
            </div>
          ) : (
            <Text fontWeight={600} fontSize={20} color={theme.gray}>
              - Invalid Pool -
            </Text>
          )}
          <div className="ml-auto">
            <SwitchZap enabled={useZap} onToggle={() => setUseZap((prev) => !prev)} />
          </div>
        </div>

        {useZap && pair ? (
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
                  title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
                  onDismiss={handleDismissConfirmation}
                  topContent={modalHeader}
                  bottomContent={modalBottom}
                />
              )}
              pendingText={pendingText}
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
                <Plus size="16" color={theme.text2} />
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
      </AppBody>

      {!addIsUnsupported ? (
        pair && !noLiquidity && pairState !== PairState.INVALID ? (
          <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '500px', marginTop: '1rem' }}>
            <MinimalInfoCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
          </AutoColumn>
        ) : null
      ) : (
        <UnsupportedCurrencyFooter
          show={addIsUnsupported}
          currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
        />
      )}
    </>
  )
}
