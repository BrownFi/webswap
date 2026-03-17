import { NumericFormat, NumericFormatProps } from 'react-number-format'

export type NumericInputProps = Omit<NumericFormatProps, 'onValueChange' | 'value' | 'customInput'> & {
  // Raw numeric string value (no formatting) or number
  value?: string | number
  // Receives the unformatted numeric string (e.g. "1000.5")
  onChange: (value: string) => void
  // Min allowed numeric value
  min?: number
  // Max allowed numeric value
  max?: number
  // Number of decimal places to allow (undefined leaves it unrestricted)
  decimalScale?: number
  // If true, clamp values to [min, max] instead of rejecting
  clampToBounds?: boolean
}

export default function NumericInput({
  value,
  onChange,
  min = 0,
  max,
  decimalScale,
  allowNegative = false,
  inputMode,
  clampToBounds = true,
  ...rest
}: NumericInputProps) {
  // Determine appropriate inputMode based on decimal support when not provided
  const resolvedInputMode = inputMode ?? (decimalScale === 0 ? 'numeric' : 'decimal')

  return (
    <NumericFormat
      {...rest}
      value={value}
      onValueChange={(vals) => {
        const raw = vals.value ?? ''
        if (raw === '') {
          onChange('')
          return
        }
        let fv = vals.floatValue
        if (fv === undefined || Number.isNaN(fv)) {
          onChange(raw)
          return
        }
        if (clampToBounds) {
          if (max !== undefined && fv > max) fv = max
          if (min !== undefined && fv < min) fv = min
        }
        onChange(String(fv))
      }}
      allowNegative={allowNegative}
      decimalScale={decimalScale}
      allowedDecimalSeparators={['.', ',']}
      inputMode={resolvedInputMode}
      // Allow typing any number; we clamp in onValueChange
      isAllowed={() => true}
      // Inherit typography by default; can be customized via style/className
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'white',
        width: '100%',
        ...rest.style,
      }}
    />
  )
}
