import reducer, { BurnState } from './reducer'
import { Field, typeInput } from './actions'

describe('burn reducer', () => {
  const initialState: BurnState = {
    independentField: Field.LIQUIDITY_PERCENT,
    typedValue: '0',
  }

  it('has correct initial state', () => {
    const state = reducer(undefined, { type: 'init' })
    expect(state).toEqual(initialState)
  })

  it('updates field and typedValue on typeInput', () => {
    const state = reducer(initialState, typeInput({ field: Field.CURRENCY_A, typedValue: '100' }))
    expect(state.independentField).toBe(Field.CURRENCY_A)
    expect(state.typedValue).toBe('100')
  })

  it('can switch between fields', () => {
    let state = reducer(initialState, typeInput({ field: Field.CURRENCY_A, typedValue: '50' }))
    expect(state.independentField).toBe(Field.CURRENCY_A)

    state = reducer(state, typeInput({ field: Field.LIQUIDITY_PERCENT, typedValue: '25' }))
    expect(state.independentField).toBe(Field.LIQUIDITY_PERCENT)
    expect(state.typedValue).toBe('25')
  })

  it('handles liquidity field', () => {
    const state = reducer(initialState, typeInput({ field: Field.LIQUIDITY, typedValue: '1000000' }))
    expect(state.independentField).toBe(Field.LIQUIDITY)
    expect(state.typedValue).toBe('1000000')
  })

  it('handles empty string value', () => {
    const state = reducer(initialState, typeInput({ field: Field.LIQUIDITY_PERCENT, typedValue: '' }))
    expect(state.typedValue).toBe('')
  })
})
