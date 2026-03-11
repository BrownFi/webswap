import { renderHook } from '@testing-library/react'
import useInterval from './useInterval'

describe('useInterval', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('calls callback immediately when leading is true', () => {
    const callback = jest.fn()
    renderHook(() => useInterval(callback, 1000, true))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not call callback immediately when leading is false', () => {
    const callback = jest.fn()
    renderHook(() => useInterval(callback, 1000, false))
    expect(callback).not.toHaveBeenCalled()
  })

  it('calls callback on each interval', () => {
    const callback = jest.fn()
    renderHook(() => useInterval(callback, 1000, false))
    jest.advanceTimersByTime(3000)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('does not start interval when delay is null', () => {
    const callback = jest.fn()
    renderHook(() => useInterval(callback, null))
    jest.advanceTimersByTime(5000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('clears interval on unmount', () => {
    const callback = jest.fn()
    const { unmount } = renderHook(() => useInterval(callback, 1000, false))
    jest.advanceTimersByTime(2000)
    expect(callback).toHaveBeenCalledTimes(2)
    unmount()
    jest.advanceTimersByTime(2000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('uses latest callback', () => {
    const results: number[] = []
    const { rerender } = renderHook(({ val }) => useInterval(() => results.push(val), 1000, false), {
      initialProps: { val: 1 },
    })
    jest.advanceTimersByTime(1000)
    rerender({ val: 2 })
    jest.advanceTimersByTime(1000)
    expect(results).toEqual([1, 2])
  })
})
