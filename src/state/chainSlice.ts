import { Chain } from '@rainbow-me/rainbowkit'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getDefaultChain } from 'connectors'
import { AppState } from 'state'

const toSerializableChain = (chain: Chain): Chain => JSON.parse(JSON.stringify(chain)) as Chain

export const chainSlice = createSlice({
  initialState: toSerializableChain(getDefaultChain() as Chain),
  name: 'selectedChain',
  reducers: {
    switchChain: (state, { payload: chain }: PayloadAction<Chain>) => {
      return toSerializableChain(chain)
    },
  },
})

export const { switchChain } = chainSlice.actions

export const chainSelector = ({ selectedChain }: AppState) => selectedChain
