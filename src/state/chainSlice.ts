import { Chain } from '@rainbow-me/rainbowkit'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { getDefaultChain } from 'connectors'

import { AppState } from 'state'

export const chainSlice = createSlice({
  initialState: getDefaultChain() as Chain,
  name: 'selectedChain',
  reducers: {
    switchChain: (state, { payload: chain }: PayloadAction<Chain>) => {
      console.debug('2. Switch chain', { chainId: chain.id, name: chain.name })
      return chain
    },
  },
})

export const { switchChain } = chainSlice.actions

export const chainSelector = ({ selectedChain }: AppState) => selectedChain
