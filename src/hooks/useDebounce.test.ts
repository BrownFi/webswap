import { renderHook, act } from '@testing-library/react'
import useDebounce from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('does not update value before delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'hello', delay: 500 },
    })
    rerender({ value: 'world', delay: 500 })
    act(() => jest.advanceTimersByTime(499))
    expect(result.current).toBe('hello')
  })

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'hello', delay: 500 },
    })
    rerender({ value: 'world', delay: 500 })
    act(() => jest.advanceTimersByTime(500))
    expect(result.current).toBe('world')
  })

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    })
    rerender({ value: 'b', delay: 300 })
    act(() => jest.advanceTimersByTime(200))
    rerender({ value: 'c', delay: 300 })
    act(() => jest.advanceTimersByTime(200))
    // 'b' should not have resolved, still 'a'
    expect(result.current).toBe('a')
    act(() => jest.advanceTimersByTime(100))
    // now 300ms since 'c' was set
    expect(result.current).toBe('c')
  })

  it('works with number values', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 0, delay: 200 },
    })
    rerender({ value: 42, delay: 200 })
    act(() => jest.advanceTimersByTime(200))
    expect(result.current).toBe(42)
  })
})
