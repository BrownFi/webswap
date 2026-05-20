import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from 'constants/common'
import { createReducer } from '@reduxjs/toolkit'
import { updateVersion } from 'state/global/actions'
import type { AggregatorChoice } from 'services/aggregators/types'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  updateUserDeadline,
  toggleURLWarning,
  updateUserSingleHopOnly,
  updateSelectedAggregator,
} from './actions'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  // One-shot flag for the 10%→0.5% slippage / 20m→10m deadline migration.
  // updateVersion fires on every app load, so we need a persisted marker to
  // avoid overwriting users who deliberately set 10% slippage themselves.
  safeDefaultsMigrated?: boolean

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  matchesDarkMode: boolean // whether the dark mode media query matches

  userExpertMode: boolean

  userSingleHopOnly: boolean // only allow swaps on direct pairs

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number

  // deadline set by user in minutes, used in all txns
  userDeadline: number

  // Smart-router preference. 'auto' = pick best amountOut among native +
  // every supported aggregator; 'native' = force BrownFi pools only; any
  // AggregatorId = force that aggregator (falls back to native if no route).
  selectedAggregator: AggregatorChoice

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }

  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair
    }
  }

  timestamp: number
  URLWarningVisible: boolean
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`
}

export const initialState: UserState = {
  userDarkMode: null,
  matchesDarkMode: false,
  userExpertMode: false,
  userSingleHopOnly: false,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  selectedAggregator: 'auto',
  tokens: {},
  pairs: {},
  timestamp: currentTimestamp(),
  URLWarningVisible: true,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userSlippageTolerance !== 'number') {
        state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userDeadline !== 'number') {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      // Smart-router policy: ALWAYS reset to 'auto' on app boot.
      // updateVersion fires once on store init (state/index.ts), so this
      // gives the user a fresh auto-tracking session every page load —
      // a stale pin from yesterday won't silently route them through a
      // worse-amountOut source today. The pin still works within a
      // session (click a row to override for this swap), it just
      // doesn't survive a reload.
      state.selectedAggregator = 'auto'

      // One-time migration: existing users who never customized their slippage
      // / deadline carried the old unsafe defaults (10% slippage, 20m deadline)
      // in their persisted Redux state. Move them onto the new safer defaults
      // (0.5% / 10m), ONCE. After this runs we flip safeDefaultsMigrated so a
      // user who deliberately re-selects 10% won't get reset on next reload.
      if (!state.safeDefaultsMigrated) {
        if (state.userSlippageTolerance === 1000) {
          state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE
        }
        if (state.userDeadline === 60 * 20) {
          state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
        }
        state.safeDefaultsMigrated = true
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      // Clamp slippage to valid range: 1 bip (0.01%) to 5000 bips (50%)
      state.userSlippageTolerance = Math.min(Math.max(action.payload.userSlippageTolerance, 1), 5000)
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSingleHopOnly, (state, action) => {
      state.userSingleHopOnly = action.payload.userSingleHopOnly
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[chainId] = state.tokens[chainId] || {}
      delete state.tokens[chainId][address]
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedPair, (state, { payload: { chainId, tokenAAddress, tokenBAddress } }) => {
      if (state.pairs[chainId]) {
        // just delete both keys if either exists
        delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)]
        delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)]
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(toggleURLWarning, (state) => {
      state.URLWarningVisible = !state.URLWarningVisible
    })
    .addCase(updateSelectedAggregator, (state, action) => {
      state.selectedAggregator = action.payload.selectedAggregator
      state.timestamp = currentTimestamp()
    }),
)
