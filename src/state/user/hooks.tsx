import { BASES_TO_TRACK_LIQUIDITY_FOR, ChainId, Pair, PINNED_PAIRS, Token } from '@brownfi/sdk'
import { useCallback, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import { flatMap } from 'lodash'

import { useActiveWeb3React } from '../../hooks'
import { useAllTokens } from '../../hooks/Tokens'
import { AppDispatch, AppState } from '../index'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  toggleURLWarning,
  updateUserSingleHopOnly,
} from './actions'
import { useVersion } from 'hooks/useVersion'

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  )
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual,
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState['user']['userExpertMode']>((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}

export function useUserSingleHopOnly(): [boolean, (newSingleHopOnly: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>()

  const singleHopOnly = useSelector<AppState, AppState['user']['userSingleHopOnly']>(
    (state) => state.user.userSingleHopOnly,
  )

  const setSingleHopOnly = useCallback(
    (newSingleHopOnly: boolean) => {
      dispatch(updateUserSingleHopOnly({ userSingleHopOnly: newSingleHopOnly }))
    },
    [dispatch],
  )

  return [singleHopOnly, setSingleHopOnly]
}

export function useUserSlippageTolerance(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userSlippageTolerance = useSelector<AppState, AppState['user']['userSlippageTolerance']>((state) => {
    return state.user.userSlippageTolerance
  })

  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance }))
    },
    [dispatch],
  )

  return [userSlippageTolerance, setUserSlippageTolerance]
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>((state) => {
    return state.user.userDeadline
  })

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch],
  )

  return [userDeadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch],
  )
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch],
  )
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveWeb3React()
  const serializedTokensMap = useSelector<AppState, AppState['user']['tokens']>(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    return Object.values(serializedTokensMap?.[chainId as ChainId] ?? {}).map(deserializeToken)
  }, [serializedTokensMap, chainId])
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch],
  )
}

export function useURLWarningVisible(): boolean {
  return useSelector((state: AppState) => state.user.URLWarningVisible)
}

export function useURLWarningToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token], version: number): Token {
  const symbol = version === 2 ? `BF-V2` : `BRF-V1`
  const name = version === 2 ? `BrownFi V2` : `BrownFi V1`
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB, version), 18, symbol, name)
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useGetListPairs(
  chainId: ChainId,
  tokens: {
    [address: string]: Token
  },
  savedSerializedPairs: {
    [chainId: number]: {
      [key: string]: SerializedPair
    }
  },
  additionalSerializedPairs?: {
    [chainId: number]: {
      [key: string]: SerializedPair
    }
  },
): [Token, Token][] {
  // pinned pairs
  const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(() => {
    if (!chainId) return []
    return flatMap(Object.keys(tokens), (tokenAddress) => {
      const token = tokens[tokenAddress]
      // for each token on the current chain,
      return (
        // loop though all bases on the current chain
        (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
          // to construct pairs of the given token with each base
          .map((base) => {
            if (base.address === token.address) {
              return null
            } else {
              return [base, token]
            }
          })
          .filter((p): p is [Token, Token] => p !== null)
      )
    })
  }, [tokens, chainId])

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return []
    const forChain = savedSerializedPairs[chainId] || additionalSerializedPairs?.[chainId]
    if (!forChain) return []

    return Object.keys(forChain).map((pairId) => {
      let token0 = deserializeToken(forChain[pairId].token0)
      if (tokens[token0.address]) {
        token0 = tokens[token0.address]
      }
      let token1 = deserializeToken(forChain[pairId].token1)
      if (tokens[token1.address]) {
        token1 = tokens[token1.address]
      }
      return [token0, token1]
    })
  }, [tokens, savedSerializedPairs, chainId])

  const combinedList = useMemo(() => generatedPairs.concat(userPairs).concat(pinnedPairs), [
    userPairs,
    generatedPairs,
    pinnedPairs,
  ])

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useActiveWeb3React()
  const { version, enableGraphQL } = useVersion({ chainId })
  const tokens = useAllTokens()

  // pairs saved by users
  const savedSerializedPairs = useSelector<AppState, AppState['user']['pairs']>(({ user: { pairs } }) => pairs)

  // defaultPools
  const additionalSerializedPairs = {
    [ChainId.BERA_MAINNET]: {
      '0x549943e04f40284185054145c6E4e9568C1D3241:0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce': {
        token0: {
          chainId: 80094,
          address: '0x549943e04f40284185054145c6E4e9568C1D3241',
          name: 'Bridged USDC',
          symbol: 'USDC.e',
          decimals: 6,
          logoURI: 'https://berascan.com/token/images/usdc_32.svg',
        },
        token1: {
          chainId: 80094,
          address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
          name: 'Honey',
          symbol: 'HONEY',
          decimals: 18,
          logoURI: 'https://berascan.com/token/images/honeybera_32.png',
        },
      },
      '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590:0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce': {
        token0: {
          chainId: 80094,
          address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
          name: 'WETH',
          symbol: 'WETH',
          decimals: 18,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png',
        },
        token1: {
          chainId: 80094,
          address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
          name: 'Honey',
          symbol: 'HONEY',
          decimals: 18,
          logoURI: 'https://berascan.com/token/images/honeybera_32.png',
        },
      },
      '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c:0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce': {
        token0: {
          chainId: 80094,
          address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
          name: 'Wrapped BTC',
          symbol: 'WBTC',
          decimals: 8,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png',
        },
        token1: {
          chainId: 80094,
          address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
          name: 'Honey',
          symbol: 'HONEY',
          decimals: 18,
          logoURI: 'https://berascan.com/token/images/honeybera_32.png',
        },
      },
      '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c:0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590': {
        token0: {
          chainId: 80094,
          address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
          name: 'Wrapped BTC',
          symbol: 'WBTC',
          decimals: 8,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png',
        },
        token1: {
          chainId: 80094,
          address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
          name: 'WETH',
          symbol: 'WETH',
          decimals: 18,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png',
        },
      },
    },
    [ChainId.ARBITRUM_SEPOLIA]: {
      '0xD3F729D909a7E84669A35c3F25b37b4AC3487784:0x831880Bd3b331249DF63bacC6e21495e5e8f1eAA': {
        token0: {
          chainId: 421614,
          address: '0xD3F729D909a7E84669A35c3F25b37b4AC3487784',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
        },
        token1: {
          chainId: 421614,
          address: '0x831880Bd3b331249DF63bacC6e21495e5e8f1eAA',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
        },
      },
    },
    [ChainId.BASE_MAINNET]: {
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913:0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        token0: {
          chainId: 8453,
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
        },
        token1: {
          chainId: 8453,
          address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          name: 'Coinbase Wrapped BTC',
          symbol: 'cbBTC',
          decimals: 8,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/32994.png',
        },
      },
    },
    [ChainId.BSC_MAINNET]: {
      '0x55d398326f99059fF775485246999027B3197955:0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c': {
        token0: {
          chainId: 56,
          address: '0x55d398326f99059fF775485246999027B3197955',
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 18,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/825.png',
        },
        token1: {
          chainId: 56,
          address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
          name: 'BTCB Token',
          symbol: 'BTCB',
          decimals: 18,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/4023.png',
        },
      },
    },
  }

  const pairs = useGetListPairs(chainId as ChainId, tokens, savedSerializedPairs, additionalSerializedPairs)

  if (enableGraphQL) {
    return []
  }

  if (version === 1) {
    return pairs.filter((pair) => `${pair[0].symbol}/${pair[1].symbol}` !== 'USDC.e/WBERA')
  }

  return pairs
}
