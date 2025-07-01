import { Chain } from '@rainbow-me/rainbowkit'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getDefaultChain } from 'connectors'
import { AppState } from 'state'

export const chainSlice = createSlice({
  initialState: getDefaultChain() as Chain,
  name: 'selectedChain',
  reducers: {
    switchChain: (state, { payload: chain }: PayloadAction<Chain>) => {
      return chain
    }
  }
})

export const { switchChain } = chainSlice.actions

export const chainSelector = ({ selectedChain }: AppState) => selectedChain
