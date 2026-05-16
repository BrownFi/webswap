import { Currency, Pair } from '@brownfi/sdk'
import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { CurrencySearchModal } from 'components/SearchModal/CurrencySearchModal'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo } from 'components/DoubleLogo'
import { RowBetween } from 'components/Row'
import { TYPE } from 'theme'
import { Input as NumericalInput } from 'components/NumericalInput'
import downIcon from 'assets/svg/arrow_drop_down.svg'

import { useActiveWeb3React } from 'hooks'
import { getTokenSymbol } from 'utils'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 0;
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: auto;
  min-width: auto;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  background: #2F2823;
  color: white;
  border-radius: 6px;
  border: 1px solid #807266;
  box-shadow: none;
  outline: none;
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  flex-shrink: 0;

  :focus,
  :hover {
    background: #2F2823;
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: #CFC7C1;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1rem;
  padding: 0 0 16px 0;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 18px;
  padding: 24px;
  z-index: 1;
  background: #2F2823;
  border: 2px solid #493E35;
  transition: background 150ms, border-color 150ms;

  &:focus-within {
    background: #120F0D;
    border-color: #C47736;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    border-radius: 12px;
  `};
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: 18px;
  border: 0;
  background-color: transparent;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
`

const StyledBalanceMax = styled.button`
  height: 24px;
  background-color: transparent;
  border: 0;
  border-radius: 0;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  padding: 0;
  font-weight: 700;
  margin-left: 8px;

  cursor: pointer;
  margin-right: 0.5rem;
  color: #C47736;
  :hover {
    border: 0;
    opacity: 0.8;
  }
  :focus {
    border: 0;
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  loading?: boolean
}

export function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  loading,
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween style={{ minHeight: 24 }}>
              <TYPE.body color={'#CFC7C1'} fontWeight={500} fontSize={16} fontFamily="'Inter', sans-serif">
                {label}
              </TYPE.body>
              <div className="flex items-center text-right">
                {account && (
                  <TYPE.body
                    onClick={onMax}
                    color={'#CFC7C1'}
                    fontWeight={400}
                    fontSize={16}
                    fontFamily="'Inter', sans-serif"
                    style={{ display: 'inline', cursor: 'pointer' }}
                  >
                    {!hideBalance && !!currency && selectedCurrencyBalance
                      ? (customBalanceText ?? 'Balance: ') + +selectedCurrencyBalance.toSignificant(6)
                      : ' -'}
                  </TYPE.body>
                )}
                {account && currency && showMaxButton && label !== 'To' && (
                  <StyledBalanceMax onClick={onMax} aria-label="Use maximum balance">
                    MAX
                  </StyledBalanceMax>
                )}
              </div>
            </RowBetween>
          </LabelRow>
        )}
        <InputRow style={hideInput ? { padding: '0', borderRadius: '6px' } : {}} selected={disableCurrencySelect}>
          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                loading={loading}
                maxDecimals={currency?.decimals}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
            </>
          )}
          <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            aria-label="Select token"
            aria-haspopup="dialog"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              <div className="flex items-center flex-1 gap-1">
                {pair ? (
                  <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={18} margin />
                ) : currency ? (
                  <CurrencyLogo currency={currency} size={'24px'} />
                ) : null}
                {pair ? (
                  <StyledTokenName className="pair-name-container">
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                    {(currency && currency.symbol && currency.symbol.length > 20
                      ? currency.symbol.slice(0, 4) +
                        '...' +
                        currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                      : getTokenSymbol(currency, chainId)) || 'Select token'}
                  </StyledTokenName>
                )}
              </div>

              {!disableCurrencySelect && <img src={downIcon} alt="down" className="w-[24px]" style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(5%) saturate(1000%) hue-rotate(350deg) brightness(90%) contrast(85%)' }} />}
            </Aligner>
          </CurrencySelect>
        </InputRow>
      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  )
}
