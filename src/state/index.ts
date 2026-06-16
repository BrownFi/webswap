import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import mint from './mint/reducer'
import lists from './lists/reducer'
import burn from './burn/reducer'
import multicall from './multicall/reducer'
import { chainSlice } from './chainSlice'
import { versionSlice } from './versionSlice'

// `version` is intentionally NOT persisted: the toggle always defaults to V3
// (see versionSlice initialState) so every visitor — new or returning — lands
// on V3. Persisting it would keep returning users on a stale V2 selection and
// defeat the V3-by-default behavior. In-session toggling still works.
const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists', chainSlice.name]

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    mint,
    burn,
    multicall,
    lists,
    [chainSlice.name]: chainSlice.reducer,
    [versionSlice.name]: versionSlice.reducer,
  },
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
