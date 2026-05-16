import React, { useEffect, useRef } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { escapeRegExp } from 'utils'

// Subtle opacity pulse used while a quote is in-flight. Sits on the SAME
// input element rather than swapping in a spinner — keeps the value
// visible, prevents layout shift, and reads as "this is updating"
// instead of "this is gone."
const pulseKeyframes = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.45; }
  100% { opacity: 1; }
`

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string; $loading?: boolean }>`
  color: ${({ error }) => (error ? '#ff6b6b' : '#FEFEFE')};
  width: 0;
  position: relative;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: ${({ fontSize }) => fontSize ?? '36px'};
  line-height: 44px;
  letter-spacing: -0.02em;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: transparent;
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  -webkit-appearance: textfield;

  ${({ $loading }) =>
    $loading &&
    css`
      animation: ${pulseKeyframes} 1.1s ease-in-out infinite;
    `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 24px;
    line-height: 32px;
  `};

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const Input = React.memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  loading,
  maxDecimals,
  ...rest
}: {
  loading?: boolean
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
  maxDecimals?: number
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      if (maxDecimals !== undefined && nextUserInput.includes('.')) {
        const decimals = nextUserInput.split('.')[1]
        if (decimals && decimals.length > maxDecimals) return
      }
      onUserInput(nextUserInput)
    }
  }

  // Last-good value retention. While loading, the parent often briefly
  // passes "" between quote refetches; we keep showing the previous value
  // so the field never blanks. When the user explicitly clears (value=""
  // AND !loading), the ref clears too.
  const refValue = useRef<string | number>(value)
  useEffect(() => {
    if (value !== refValue.current && value !== '') {
      refValue.current = value
    } else if (value === '' && !loading) {
      refValue.current = ''
    }
  }, [value, loading])

  const displayedValue = value === '' && loading ? refValue.current : value

  return (
    <StyledInput
      {...rest}
      $loading={loading}
      value={displayedValue}
      onChange={(event) => {
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        enforcer(event.target.value.replace(/,/g, '.'))
      }}
      // universal input options
      inputMode="decimal"
      title="Token Amount"
      aria-label="Token amount"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || '0.0'}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  )
})

export default Input
