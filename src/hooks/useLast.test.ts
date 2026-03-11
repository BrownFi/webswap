import { renderHook } from '@testing-library/react'
import useLast, { useLastTruthy } from './useLast'

describe('useLast', () => {
  it('returns undefined when initial value does not pass filter', () => {
    const { result } = renderHook(() => useLast(null, (v) => v !== null))
    expect(result.current).toBeUndefined()
  })

  it('returns initial value when it passes the filter', () => {
    const { result } = renderHook(() => useLast('hello', (v) => v !== null))
    expect(result.current).toBe('hello')
  })

  it('returns initial value when no filter is provided', () => {
    const { result } = renderHook(() => useLast('hello'))
    expect(result.current).toBe('hello')
  })

  it('updates to new value when filter passes', () => {
    const { result, rerender } = renderHook(({ value }) => useLast(value, (v) => v !== null), {
      initialProps: { value: 'first' as string | null },
    })
    rerender({ value: 'second' })
    expect(result.current).toBe('second')
  })

  it('keeps last passing value when new value fails filter', () => {
    const { result, rerender } = renderHook(({ value }) => useLast(value, (v) => v !== null), {
      initialProps: { value: 'first' as string | null },
    })
    rerender({ value: null })
    expect(result.current).toBe('first')
  })
})

describe('useLastTruthy', () => {
  it('returns undefined for initial null', () => {
    const { result } = renderHook(() => useLastTruthy(null))
    expect(result.current).toBeUndefined()
  })

  it('returns the value when truthy', () => {
    const { result } = renderHook(() => useLastTruthy('hello'))
    expect(result.current).toBe('hello')
  })

  it('keeps last truthy value when value becomes null', () => {
    const { result, rerender } = renderHook(({ value }) => useLastTruthy(value), {
      initialProps: { value: 'hello' as string | null },
    })
    rerender({ value: null })
    expect(result.current).toBe('hello')
  })

  it('updates when a new truthy value arrives', () => {
    const { result, rerender } = renderHook(({ value }) => useLastTruthy(value), {
      initialProps: { value: 'first' as string | null },
    })
    rerender({ value: null })
    rerender({ value: 'second' })
    expect(result.current).toBe('second')
  })
})
