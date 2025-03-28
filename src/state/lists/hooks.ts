/* eslint-disable @typescript-eslint/no-unused-expressions */
import { UNSUPPORTED_LIST_URLS } from './../../constants/lists'
import DEFAULT_TOKEN_LIST from './defaultTokens.json'
import { ChainId, Token } from '@brownfi/sdk'
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../index'
import sortByListPriority from 'utils/listSort'
import UNSUPPORTED_TOKEN_LIST from '../../constants/tokenLists/uniswap-v2-unsupported.tokenlist.json'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
    this.tags = tags
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI
  }
}

export type TokenAddressMap = Readonly<
  { [chainId in ChainId]: Readonly<{ [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList } }> }
>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.SEPOLIA]: {},
  [ChainId.MAINNET]: {},
  [ChainId.SN_MAIN]: {},
  [ChainId.SN_SEPOLIA]: {},
  [ChainId.BSC_TESTNET]: {},
  [ChainId.VICTION_TESTNET]: {},
  [ChainId.VICTION_MAINNET]: {},
  [ChainId.SONIC_TESTNET]: {},
  [ChainId.MINATO_SONEIUM]: {},
  [ChainId.BASE_SEPOLIA]: {},
  [ChainId.UNICHAIN_SEPOLIA]: {},
  [ChainId.AURORA_TESTNET]: {},
  [ChainId.METIS_MAINNET]: {},
  [ChainId.TAIKO_TESTNET]: {}
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result

  const map = list?.tokens?.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map(tagId => {
            if (!list.tags?.[tagId]) return undefined
            return { ...list.tags[tagId], id: tagId }
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? []
      const token = new WrappedTokenInfo(tokenInfo, tags)
      if (tokenMap?.[token.chainId]?.[token.address] !== undefined) {
        console.error(new Error(`Duplicate token! ${token.address}`))
        return tokenMap
      }
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: {
            token,
            list: list
          }
        }
      }
    },
    { ...EMPTY_LIST }
  )
  listCache?.set(list, map || {})
  return map || {}
}

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  return useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
}

function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  return {
    1: { ...map1[1], ...map2[1] },
    [ChainId.SEPOLIA]: { ...map1[ChainId.SEPOLIA], ...map2[ChainId.SEPOLIA] },
    [ChainId.SN_SEPOLIA]: { ...map1[ChainId.SN_SEPOLIA], ...map2[ChainId.SN_SEPOLIA] },
    [ChainId.SN_MAIN]: { ...map1[ChainId.SN_MAIN], ...map2[ChainId.SN_MAIN] },
    [ChainId.BSC_TESTNET]: { ...map1[ChainId.BSC_TESTNET], ...map2[ChainId.BSC_TESTNET] },
    [ChainId.VICTION_TESTNET]: { ...map1[ChainId.VICTION_TESTNET], ...map2[ChainId.VICTION_TESTNET] },
    [ChainId.VICTION_MAINNET]: { ...map1[ChainId.VICTION_MAINNET], ...map2[ChainId.VICTION_MAINNET] },
    [ChainId.SONIC_TESTNET]: { ...map1[ChainId.SONIC_TESTNET], ...map2[ChainId.SONIC_TESTNET] },
    [ChainId.MINATO_SONEIUM]: { ...map1[ChainId.MINATO_SONEIUM], ...map2[ChainId.MINATO_SONEIUM] },
    [ChainId.BASE_SEPOLIA]: { ...map1[ChainId.BASE_SEPOLIA], ...map2[ChainId.BASE_SEPOLIA] },
    [ChainId.UNICHAIN_SEPOLIA]: { ...map1[ChainId.UNICHAIN_SEPOLIA], ...map2[ChainId.UNICHAIN_SEPOLIA] },
    [ChainId.AURORA_TESTNET]: { ...map1[ChainId.AURORA_TESTNET], ...map2[ChainId.AURORA_TESTNET] },
    [ChainId.METIS_MAINNET]: { ...map1[ChainId.METIS_MAINNET], ...map2[ChainId.METIS_MAINNET] },
    [ChainId.TAIKO_TESTNET]: { ...map1[ChainId.TAIKO_TESTNET], ...map2[ChainId.TAIKO_TESTNET] }
  }
}

// merge tokens contained within lists from urls
function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  const lists = useAllLists()
  return useMemo(() => {
    if (!urls) return EMPTY_LIST
    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          const current = lists[currentUrl]?.current
          if (!current) return allTokens
          try {
            const newTokens = Object.assign(listToTokenMap(current))
            return combineMaps(allTokens, newTokens)
          } catch (error) {
            console.error('Could not show token list due to error', error)
            return allTokens
          }
        }, EMPTY_LIST)
    )
  }, [lists, urls])
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  return useSelector<AppState, AppState['lists']['activeListUrls']>(state => state.lists.activeListUrls)?.filter(
    url => !UNSUPPORTED_LIST_URLS.includes(url)
  )
}

export function useInactiveListUrls(): string[] {
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(url => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS.includes(url))
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  const activeListUrls = useActiveListUrls()
  const activeTokens = useCombinedTokenMapFromUrls(activeListUrls)
  const defaultTokenMap = listToTokenMap(DEFAULT_TOKEN_LIST)
  return combineMaps(activeTokens, defaultTokenMap)
}

// all tokens from inactive lists
export function useCombinedInactiveList(): TokenAddressMap {
  const allInactiveListUrls: string[] = useInactiveListUrls()
  return useCombinedTokenMapFromUrls(allInactiveListUrls)
}

// used to hide warnings on import for default tokens
export function useDefaultTokenList(): TokenAddressMap {
  return listToTokenMap(DEFAULT_TOKEN_LIST)
}

// list of tokens not supported on interface, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // get hard coded unsupported tokens
  const localUnsupportedListMap = listToTokenMap(UNSUPPORTED_TOKEN_LIST)

  // get any loaded unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS)

  // format into one token address map
  return combineMaps(localUnsupportedListMap, loadedUnsupportedListMap)
}

export function useIsListActive(url: string): boolean {
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}
