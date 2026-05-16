import { useState, useRef, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import QuestionHelper from 'components/QuestionHelper'
import { TYPE } from 'theme'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed } from 'components/Row'

import { darken } from 'polished'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const FancyButton = styled.button`
  color: #978A80;
  align-items: center;
  height: 48px;
  border-radius: 8px;
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  width: auto;
  min-width: 3.5rem;
  border: 1px solid #2F2823;
  outline: none;
  background: #120F0D;
  padding: 12px 8px;
  :hover {
    border: 1px solid #2F2823;
    cursor: pointer;
  }
  :focus {
    border: 1px solid #2F2823;
  }
`

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  :hover {
    cursor: pointer;
  }
  background: ${({ active }) => active ? '#493E35' : '#120F0D'};
  border: ${({ active }) => active ? '1px solid #C47736' : '1px solid #2F2823'};
  color: ${({ active }) => active ? '#FFFFFF' : '#978A80'};
  font-family: Inter;
  font-weight: 500;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  padding: 12px 8px;
`

const Input = styled.input`
  background: transparent;
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ color }) => (color === 'red' ? '#ff6871' : '#978A80')};
  text-align: right;
`

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 48px;
  position: relative;
  padding: 12px 16px;
  flex: 1;
  background: #120F0D;
  border: 1px solid ${({ warning }) => warning ? '#ff6871' : '#2F2823'};
  border-radius: 8px;
  :hover {
    border: 1px solid ${({ warning }) => warning ? darken(0.1, '#ff6871') : '#2F2823'};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 8px;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

export interface SlippageTabsProps {
  rawSlippage: number
  setRawSlippage: (rawSlippage: number) => void
  deadline: number
  setDeadline: (deadline: number) => void
}

export default function SlippageTabs({ rawSlippage, setRawSlippage, deadline, setDeadline }: SlippageTabsProps) {
  const theme = useContext(ThemeContext)

  const inputRef = useRef<HTMLInputElement>()

  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const slippageInputIsValid =
    slippageInput === '' || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && rawSlippage < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && rawSlippage > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  function parseCustomSlippage(value: string) {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setRawSlippage(valueAsIntFromRoundedFloat)
      }
    } catch { /* intentionally empty */ }
  }

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value)

    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setDeadline(valueAsInt)
      }
    } catch { /* intentionally empty */ }
  }

  return (
    <AutoColumn gap="20px">
      <AutoColumn gap="sm">
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16} color={theme.white}>
            Slippage tolerance
          </TYPE.black>
          <QuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
        </RowFixed>
        <RowBetween>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(10)
            }}
            active={rawSlippage === 10}
          >
            0.1%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(50)
            }}
            active={rawSlippage === 50}
          >
            0.5%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(100)
            }}
            active={rawSlippage === 100}
          >
            1%
          </Option>
          <OptionCustom active={![10, 50, 100].includes(rawSlippage)} warning={!slippageInputIsValid} tabIndex={-1}>
            <RowBetween>
              {!!slippageInput &&
              (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
                <SlippageEmojiContainer>
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null}
              {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
              <Input
                ref={inputRef as any}
                placeholder={(rawSlippage / 100).toFixed(2)}
                value={slippageInput}
                onBlur={() => {
                  parseCustomSlippage((rawSlippage / 100).toFixed(2))
                }}
                onChange={(e) => parseCustomSlippage(e.target.value)}
                color={!slippageInputIsValid ? 'red' : ''}
                aria-label="Custom slippage percentage"
              />
              %
            </RowBetween>
          </OptionCustom>
        </RowBetween>
        {!!slippageError && (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E',
            }}
          >
            {slippageError === SlippageError.InvalidInput
              ? 'Enter a valid slippage percentage'
              : slippageError === SlippageError.RiskyLow
              ? 'Your transaction may fail'
              : 'Your transaction may be frontrun'}
          </RowBetween>
        )}
      </AutoColumn>

      <AutoColumn gap="sm">
        <RowFixed>
          <TYPE.black fontSize={16} fontWeight={500} color={theme.white}>
            Transaction deadline
          </TYPE.black>
          <QuestionHelper text="Your transaction will revert if it is pending for more than this long." />
        </RowFixed>
        <RowFixed>
          <OptionCustom style={{ width: '100%' }} tabIndex={-1}>
            <Input
              color={!!deadlineError ? 'red' : undefined}
              onBlur={() => {
                parseCustomDeadline((deadline / 60).toString())
              }}
              placeholder={(deadline / 60).toString()}
              value={deadlineInput}
              onChange={(e) => parseCustomDeadline(e.target.value)}
              aria-label="Transaction deadline in minutes"
            />
          </OptionCustom>
          <TYPE.body style={{ paddingLeft: '8px', fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: '#978A80' }}>
            minutes
          </TYPE.body>
        </RowFixed>
      </AutoColumn>
    </AutoColumn>
  )
}
