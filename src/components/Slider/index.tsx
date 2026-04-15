import { useCallback } from 'react'
import RCSlider from 'rc-slider'

interface InputSliderProps {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  size?: number
}

export default function Slider({ value, onChange, min = 0, step = 1, max = 100 }: InputSliderProps) {
  const changeCallback = useCallback(
    (e: any) => {
      onChange(e)
    },
    [onChange],
  )

  return (
    <RCSlider
      // size={size}
      // type="range"
      value={value}
      style={{ width: '90%', marginLeft: 15, marginRight: 15, padding: '15px 0' }}
      onChange={changeCallback}
      aria-labelledby="input slider"
      step={step}
      min={min}
      max={max}
      dotStyle={{
        backgroundColor: '#c4943a',
      }}
      activeDotStyle={{
        backgroundColor: '#c4943a',
      }}
      styles={{
        rail: {
          backgroundColor: '#1a1510',
        },
        track: {
          backgroundColor: '#c4943a',
        },
      }}
    />
  )
}
