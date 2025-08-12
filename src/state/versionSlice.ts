import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { AppState } from 'state'

export const versionSlice = createSlice({
  initialState: { version: 2 },
  name: 'version',
  reducers: {
    switchVersion: (state, { payload: version }: PayloadAction<number>) => {
      return { version }
    },
  },
})

export const { switchVersion } = versionSlice.actions

export const versionSelector = ({ version }: AppState) => version
