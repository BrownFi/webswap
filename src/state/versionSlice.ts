import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from 'state'
import { VERSION } from 'lib/sdk/constants/addresses'

export const versionSlice = createSlice({
  // Default the version toggle to V3 (Official) so users land on V3 (e.g. on
  // /pool); V2 LPs flip the toggle to V2 to remove funds. IMPORTANT: `version`
  // stays in PERSISTED_KEYS (state/index.ts) — the toggle reloads the page
  // (SwitchVersion) and re-reads the persisted value, so persistence is what
  // makes switching stick across that reload. Chains without a V3 deployment
  // fall back to V2 inside useVersion, so this is safe on every chain.
  initialState: { version: VERSION.V3_OFFICIAL as number },
  // Slice name bumped 'version' → 'versionToggle' as a ONE-TIME RESET: the
  // persisted localStorage key is derived from this name, so renaming orphans
  // the old stored value (V2 for returning users) and EVERYONE — new and
  // returning — starts fresh on the V3 default above. Their later toggle
  // choices persist under the new key as normal.
  name: 'versionToggle',
  reducers: {
    switchVersion: (state, { payload: version }: PayloadAction<number>) => {
      return { version }
    },
  },
})

export const { switchVersion } = versionSlice.actions

export const versionSelector = (state: AppState) => state.versionToggle
