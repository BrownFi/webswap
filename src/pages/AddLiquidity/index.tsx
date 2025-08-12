import { addLiquidity, Currency, currencyEquals, getRouterAddress, TokenAmount, WETH } from '@brownfi/sdk'
import React, { useCallback, useContext, useState } from 'react'
import { Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { BlueCard, LightCard } from 'components/Card'
import { AutoColumn, ColumnCenter } from 'components/Column'
import { TransactionConfirmationModal, ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { DoubleCurrencyLogo } from 'components/DoubleLogo'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { MinimalPositionCard } from 'components/PositionCard/MinimalPositionCard'
import Row, { RowBetween, RowFlat } from 'components/Row'

import { PairState } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { Field } from 'state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks'

import { useTransactionAdder } from 'state/transactions/hooks'
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks'
import { TYPE } from 'theme'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { AppBody } from 'pages/AppBody'
import { Dots, Wrapper } from 'pages/Pool/styleds'
import { ConfirmAddModalBottom } from './ConfirmAddModalBottom'
import { currencyId } from 'utils/currencyId'
import { PoolPriceBar } from './PoolPriceBar'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { getTokenSymbol } from 'utils'
import ConnectWallet from 'components/ConnectWallet'
import { usePythPrices } from 'hooks/usePythPrices'
import { useVersion } from 'hooks/useVersion'
import { useToast } from 'containers/ToastProvider'

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const { version } = useVersion({ chainId })
  const { createToast } = useToast()

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const pythPrices = usePythPrices({ currencyA, currencyB, chainId })

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
    [dependentField]: noLiquidity ? otherTypedValue : dependentAmount === 0 ? '' : dependentAmount.toPrecision(6),
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
    [dependentField]: noLiquidity
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

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    getRouterAddress(chainId || 0, version),
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    getRouterAddress(chainId || 0, version),
  )

  const addTransaction = useTransactionAdder()

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

        addTransaction(response, {
          summary:
            'Add ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            getTokenSymbol(currencies[Field.CURRENCY_A], chainId) +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            getTokenSymbol(currencies[Field.CURRENCY_B], chainId),
        })

        setTxHash(response.hash)
      }
    } catch (e) {
      setAttemptingTxn(false)
      // we only care if the error is something _other_ than the user rejected the tx
      if ((e as any)?.code !== 4001) {
        console.error(error)
      }

      if (typeof (e as any)?.reason === 'string') {
        createToast((e as any)?.reason, 'error')
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
        history.push(`/add/${currencyIdB}/${currencyIdA}`)
      } else {
        history.push(`/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, history, currencyIdA],
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          history.push(`/add/${newCurrencyIdB}`)
        }
      } else {
        history.push(`/add/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, history, currencyIdB],
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const isCreate = history.location.pathname.includes('/create')

  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={isCreate} adding={true} />
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
            {noLiquidity ||
              (isCreate ? (
                <ColumnCenter>
                  <BlueCard className="!w-full">
                    <AutoColumn gap="10px">
                      <TYPE.link fontWeight={600} color={'#27E3AB'}>
                        You are the first liquidity provider.
                      </TYPE.link>
                      <TYPE.link fontWeight={500} color={'#27E3AB'}>
                        The ratio of tokens you add will set the price of this pool.
                      </TYPE.link>
                      <TYPE.link fontWeight={500} color={'#27E3AB'}>
                        Once you are happy with the rate click supply to review.
                      </TYPE.link>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ) : (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <TYPE.link fontWeight={500} color={'#27E3AB'}>
                        <b>Tip:</b> When you add liquidity, you will receive pool tokens representing your position.
                        These tokens automatically earn fees proportional to your share of the pool, and can be redeemed
                        at any time.
                      </TYPE.link>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ))}
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
              <>
                <div>
                  <RowBetween padding="1rem">
                    <TYPE.subHeader fontWeight={700} fontSize={16} color={'white'}>
                      {noLiquidity ? 'Initial prices' : 'Prices'} and pool share
                    </TYPE.subHeader>
                  </RowBetween>{' '}
                  <PoolPriceBar
                    currencies={currencies}
                    poolTokenPercentage={poolTokenPercentage}
                    noLiquidity={noLiquidity}
                    price={price}
                  />
                </div>
              </>
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
      </AppBody>
      {!addIsUnsupported ? (
        pair && !noLiquidity && pairState !== PairState.INVALID ? (
          <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '500px', marginTop: '1rem' }}>
            <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
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
