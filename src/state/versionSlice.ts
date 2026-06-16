import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from 'state'
import { VERSION } from 'lib/sdk/constants/addresses'

export const versionSlice = createSlice({
  // Default everyone to V3 (Official): the version toggle starts on V3 so new +
  // returning users land on V3 (e.g. on /pool). V2 LPs flip the toggle back to
  // remove their funds. Chains without a V3 deployment fall back to V2 inside
  // useVersion, so this is safe across all chains. NOTE: `version` is also
  // dropped from PERSISTED_KEYS (state/index.ts) so a stale stored V2 selection
  // doesn't override this default for returning users.
  initialState: { version: VERSION.V3_OFFICIAL as number },
  name: 'version',
  reducers: {
    switchVersion: (state, { payload: version }: PayloadAction<number>) => {
      return { version }
    },
  },
})

export const { switchVersion } = versionSlice.actions

export const versionSelector = ({ version }: AppState) => version
