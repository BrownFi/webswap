import { renderHook } from '@testing-library/react'
import useInterval from './useInterval'

describe('useInterval', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls callback immediately when leading is true', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000, true))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not call callback immediately when leading is false', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000, false))
    expect(callback).not.toHaveBeenCalled()
  })

  it('calls callback on each interval', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000, false))
    vi.advanceTimersByTime(3000)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('does not start interval when delay is null', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, null))
    vi.advanceTimersByTime(5000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('clears interval on unmount', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useInterval(callback, 1000, false))
    vi.advanceTimersByTime(2000)
    expect(callback).toHaveBeenCalledTimes(2)
    unmount()
    vi.advanceTimersByTime(2000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('uses latest callback', () => {
    const results: number[] = []
    const { rerender } = renderHook(({ val }) => useInterval(() => results.push(val), 1000, false), {
      initialProps: { val: 1 },
    })
    vi.advanceTimersByTime(1000)
    rerender({ val: 2 })
    vi.advanceTimersByTime(1000)
    expect(results).toEqual([1, 2])
  })
})
