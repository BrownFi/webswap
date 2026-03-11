import { renderHook } from '@testing-library/react'
import usePrevious from './usePrevious'

describe('usePrevious', () => {
  it('returns undefined on initial render', () => {
    const { result } = renderHook(() => usePrevious('first'))
    expect(result.current).toBeUndefined()
  })

  it('returns previous value after rerender', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    })
    rerender({ value: 'second' })
    expect(result.current).toBe('first')
  })

  it('tracks multiple changes', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    })
    rerender({ value: 2 })
    expect(result.current).toBe(1)
    rerender({ value: 3 })
    expect(result.current).toBe(2)
    rerender({ value: 4 })
    expect(result.current).toBe(3)
  })
})
