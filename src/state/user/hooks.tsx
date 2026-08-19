import { isV3Like } from '@brownfi/sdk'
import { BASES_TO_TRACK_LIQUIDITY_FOR, ChainId, Pair, PINNED_PAIRS, Token } from '@brownfi/sdk'
import { useCallback, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import { useActiveWeb3React } from 'hooks'
import { useAllTokens } from 'hooks/Tokens'
import { AppDispatch, AppState } from 'state'
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
  updateSelectedAggregator,
} from './actions'
import type { AggregatorChoice } from 'services/aggregators/types'
import { isMainnet } from 'connectors'

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

export function useSelectedAggregator(): [AggregatorChoice, (next: AggregatorChoice) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const selected = useSelector<AppState, AggregatorChoice>((state) => {
    const raw = state.user.selectedAggregator ?? 'auto'
    // Legacy persisted value: pre-rename, 'native' meant "auto-pick best
    // native route." The reducer's updateVersion migrates it on boot, but
    // belt-and-suspenders the runtime path so stale subscriptions can't
    // leak the legacy string into downstream comparisons.
    return (raw as unknown as string) === 'native' ? 'auto' : raw
  })
  const setSelected = useCallback(
    (next: AggregatorChoice) => {
      dispatch(updateSelectedAggregator({ selectedAggregator: next }))
    },
    [dispatch],
  )
  return [selected, setSelected]
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
  const symbol = version >= 2 ? (isV3Like(version) ? `BF-V3` : `BF-V2`) : `BRF-V1`
  const name = version >= 2 ? (isV3Like(version) ? `BrownFi V3` : `BrownFi V2`) : `BrownFi V1`
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
    return Object.keys(tokens).flatMap((tokenAddress) => {
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
export function useTrackedTokenPairs(options?: { disabled?: boolean }): [Token, Token][] {
  const { chainId } = useActiveWeb3React()
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
          name: 'BUSD',
          symbol: 'BUSD',
          decimals: 18,
          logoURI: '/images/busd.png',
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
          name: 'BUSD',
          symbol: 'BUSD',
          decimals: 18,
          logoURI: '/images/busd.png',
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
          name: 'BUSD',
          symbol: 'BUSD',
          decimals: 18,
          logoURI: '/images/busd.png',
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
    [ChainId.ROBINHOOD_MAINNET]: {
      '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea:0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168': {
        token0: {
          chainId: 4663,
          address: '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea',
          name: 'Space Exploration Technologies Corp. Class A Common Stock • Robinhood Token',
          symbol: 'SPCX',
          decimals: 18,
          logoURI: 'https://cdn.robinhood.com/ncw_assets/logos/0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea.png',
        },
        token1: {
          chainId: 4663,
          address: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
          name: 'Global Dollar',
          symbol: 'USDG',
          decimals: 6,
          logoURI: 'https://coin-images.coingecko.com/coins/images/51281/small/GDN_USDG_Token_200x200.png?1730484111',
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
      '0x000Ae314E2A2172a039B26378814C252734f556A:0x55d398326f99059fF775485246999027B3197955': {
        token0: {
          chainId: 56,
          address: '0x000Ae314E2A2172a039B26378814C252734f556A',
          name: 'Aster',
          symbol: 'ASTER',
          decimals: 18,
          logoURI: 'https://bscscan.com/token/images/astertoken_64.png',
        },
        token1: {
          chainId: 56,
          address: '0x55d398326f99059fF775485246999027B3197955',
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 18,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/825.png',
        },
      },
    },
    [ChainId.HYPER_EVM]: {
      '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb:0xfD739d4e423301CE9385c1fb8850539D657C296D': {
        token0: {
          chainId: 999,
          address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
          name: 'USD₮0',
          symbol: 'USDT',
          decimals: 6,
          logoURI: 'https://assets.coingecko.com/coins/images/68307/standard/usdt0.jpg',
        },
        token1: {
          chainId: 999,
          address: '0xfD739d4e423301CE9385c1fb8850539D657C296D',
          name: 'kHYPE',
          symbol: 'kHYPE',
          decimals: 18,
          logoURI: 'https://assets.coingecko.com/coins/images/67388/standard/khype.png',
        },
      },
    },
    [ChainId.LINEA_MAINNET]: {
      '0x176211869cA2b568f2A7D4EE941E073a821EE1ff:0x1789e0043623282D5DCc7F213d703C6D8BAfBB04': {
        token0: {
          chainId: 59144,
          address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
        },
        token1: {
          chainId: 59144,
          address: '0x1789e0043623282D5DCc7F213d703C6D8BAfBB04',
          name: 'Linea',
          symbol: 'LINEA',
          decimals: 18,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/27657.png',
        },
      },
      '0x176211869cA2b568f2A7D4EE941E073a821EE1ff:0xA219439258ca9da29E9Cc4cE5596924745e12B93': {
        token0: {
          chainId: 59144,
          address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
          logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
        },
        token1: {
          chainId: 59144,
          address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
          name: 'USDT',
          symbol: 'USDT',
          decimals: 6,
          logoURI: 'https://lineascan.build/token/images/bridgedusdt2_ofc_64.png',
        },
      },
    },
    [ChainId.MONAD]: {
      '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a:0x754704Bc059F8C67012fEd69BC8A327a5aafb603': {
        token0: {
          chainId: 143,
          address: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a',
          name: 'AUSD',
          symbol: 'AUSD',
          decimals: 6,
          logoURI: 'https://monadscan.com/token/images/agrousd_64.png',
        },
        token1: {
          chainId: 143,
          address: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
          logoURI: 'https://monadscan.com/token/images/usdc_ofc_32.svg',
        },
      },
    },
  }

  const pairs = useGetListPairs(chainId as ChainId, tokens, savedSerializedPairs, additionalSerializedPairs)

  if (options?.disabled) {
    return []
  }

  // Filter pairs using Liem's api
  const filteredPairs = pairs.filter((tokens) => {
    const symbol = `${tokens[0].symbol}/${tokens[1].symbol}`
    if (isMainnet) {
      if (chainId === ChainId.ARBITRUM_MAINNET) {
        return !['WBTC/WETH', 'WETH/USDT'].includes(symbol)
      }
    }
    return true
  })

  return filteredPairs
}
