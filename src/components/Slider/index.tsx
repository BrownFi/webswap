import React, { useCallback } from 'react'
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
        backgroundColor: '#27E3AB',
      }}
      activeDotStyle={{
        backgroundColor: '#27E3AB',
      }}
      styles={{
        rail: {
          backgroundColor: '#1d1c21',
        },
        track: {
          backgroundColor: '#27E3AB',
        },
      }}
    />
  )
}
