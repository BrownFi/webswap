import { renderHook, act } from '@testing-library/react'
import useToggle from './useToggle'

describe('useToggle', () => {
  it('defaults to false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current[0]).toBe(false)
  })

  it('accepts initial state true', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current[0]).toBe(true)
  })

  it('toggles from false to true', () => {
    const { result } = renderHook(() => useToggle())
    act(() => result.current[1]())
    expect(result.current[0]).toBe(true)
  })

  it('toggles back to false', () => {
    const { result } = renderHook(() => useToggle())
    act(() => result.current[1]())
    act(() => result.current[1]())
    expect(result.current[0]).toBe(false)
  })

  it('returns a stable toggle function', () => {
    const { result, rerender } = renderHook(() => useToggle())
    const firstToggle = result.current[1]
    rerender()
    expect(result.current[1]).toBe(firstToggle)
  })
})
