import { Currency, CurrencyAmount, currencyEquals, ETHER, getPythPricesBatch, Token, WETH } from '@brownfi/sdk'
import Column from 'components/Column'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { Loader } from 'components/Loader'
import { MouseoverTooltip } from 'components/Tooltip'
import { useActiveWeb3React } from 'hooks'
import { useAllInactiveTokens, useIsUserAddedToken } from 'hooks/Tokens'
import { useVersion } from 'hooks/useVersion'
import { CSSProperties, MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'
import { FixedSizeList, VariableSizeList } from 'react-window'
import { Text } from 'components/Rebass'
import { useCombinedActiveList, WrappedTokenInfo } from 'state/lists/hooks'
import { useAllTokenBalances, useCurrencyBalance, useETHBalances } from 'state/wallet/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { getTokenName, getTokenSymbol, isTokenOnList } from 'utils'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useQuery } from '@tanstack/react-query'
import ImportRow from './ImportRow'
import { MenuItem } from './styleds'

const HEADER_HELD = '__HEADER_YOUR_TOKENS__'
const HEADER_REST = '__HEADER_ALL_TOKENS__'

function formatUsd(value: number): string {
  if (value < 0.01) return '<$0.01'
  if (value < 1) return `$${value.toFixed(3)}`
  if (value < 1000) return `$${value.toFixed(2)}`
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function currencyKey(currency: Currency): string {
  return currency instanceof Token ? currency.address : currency === ETHER ? 'ETHER' : ''
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

function Balance({ balance }: { balance: CurrencyAmount }) {
  return (
    <StyledBalanceText title={balance.toExact()} fontSize={'16px'} fontWeight={500} color="white">
      {balance.toSignificant(4)}
    </StyledBalanceText>
  )
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  usdValue,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
  usdValue?: number
}) {
  const { account, chainId } = useActiveWeb3React()
  const key = currencyKey(currency)
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <CurrencyLogo currency={currency} size={'28px'} />
      <Column>
        <Text title={currency.name} fontWeight={500} fontSize={'16px'} color={'white'}>
          {getTokenSymbol(currency, chainId)}
        </Text>
        <TYPE.darkGray ml="0px" fontSize={'12px'} fontWeight={500} color="white" opacity={'0.5'}>
          {getTokenName(currency, chainId)} {!isOnSelectedList && customAdded && '• Added by user'}
        </TYPE.darkGray>
      </Column>
      <TokenTags currency={currency} />
      <Column style={{ justifySelf: 'flex-end', alignItems: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
        {balance && usdValue !== undefined && usdValue > 0 && (
          <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#978A80', marginTop: 2 }}>
            {formatUsd(usdValue)}
          </span>
        )}
      </Column>
    </MenuItem>
  )
}

function SectionHeader({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#978A80',
      }}
    >
      {label}
    </div>
  )
}

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH,
  showImportView,
  setImportToken,
  breakIndex,
}: {
  height: number
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showETH: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
  breakIndex: number | undefined
}) {
  const { account, chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const inactiveTokens: {
    [address: string]: Token
  } = useAllInactiveTokens()

  // Held-tokens partition for the active section. Inactive tokens after
  // breakIndex stay in their existing order so the import-row logic keeps
  // working unchanged.
  const balances = useAllTokenBalances()
  const activeCurrencies = useMemo(
    () => (breakIndex !== undefined ? currencies.slice(0, breakIndex) : currencies),
    [currencies, breakIndex],
  )
  const inactiveCurrencies = useMemo(
    () => (breakIndex !== undefined ? currencies.slice(breakIndex) : []),
    [currencies, breakIndex],
  )

  // Native balance (BERA on Berachain etc.). useAllTokenBalances only returns
  // ERC-20 balances, so we'd miss the user's native holding without this.
  const ethBalances = useETHBalances(account ? [account] : [])
  const nativeBalance = account ? ethBalances[account] : undefined
  const hasNative = !!nativeBalance && nativeBalance.greaterThan('0')

  const heldList = useMemo(() => {
    const tokens = activeCurrencies.filter((c) => {
      if (!(c instanceof Token)) return false
      const bal = balances[c.address]
      return bal && bal.greaterThan('0')
    })
    // Always surface the native token in "Your tokens" when the user holds it,
    // regardless of whether showETH would add it elsewhere — we de-dupe below.
    return hasNative ? [Currency.ETHER as Currency, ...tokens] : tokens
  }, [activeCurrencies, balances, hasNative])

  const restList = useMemo(() => {
    const heldTokenAddrs = new Set(
      heldList.filter((c) => c instanceof Token).map((c) => (c as Token).address),
    )
    return activeCurrencies.filter((c) => !(c instanceof Token) || !heldTokenAddrs.has(c.address))
  }, [activeCurrencies, heldList])

  // Batched Pyth USD prices for held tokens. Previously this was a
  // useQueries fan-out (one getPythPrice call per token), which meant
  // 2 RPC calls per token (priceFeedId + getPriceUnsafe) — 20+ RPC calls
  // for a 10-token wallet on modal open. The new getPythPricesBatch
  // collapses every token into ONE multicall pair: two RPC calls total
  // regardless of N. For the native token we look up the wrapped variant's
  // feed (WBERA = BERA price).
  const wrappedNative = chainId ? WETH[chainId as keyof typeof WETH] : undefined
  const heldTokens = useMemo(() => heldList.filter((c) => c instanceof Token) as Token[], [heldList])
  const priceTargets = useMemo(() => {
    const addrs = heldTokens.map((t) => t.address)
    if (hasNative && wrappedNative?.address && !addrs.includes(wrappedNative.address)) {
      addrs.push(wrappedNative.address)
    }
    return addrs
  }, [heldTokens, hasNative, wrappedNative])
  // The query key includes a stable signature of the address set so React
  // Query caches per held-token set rather than refetching on every render
  // (priceTargets is a fresh array each pass, but the join is stable).
  const targetsKey = useMemo(() => [...priceTargets].sort().join(','), [priceTargets])
  const { data: usdByAddress = {} as Record<string, number> } = useQuery({
    queryKey: ['pyth-prices-batch', chainId, targetsKey],
    queryFn: () => getPythPricesBatch(priceTargets, chainId!, version),
    enabled: !!chainId && priceTargets.length > 0,
    staleTime: 30_000,
  })
  const nativeUsd = wrappedNative?.address ? usdByAddress[wrappedNative.address.toLowerCase()] : undefined

  // Sort held tokens by USD value desc (priced first, unpriced last by balance).
  const heldSorted = useMemo(() => {
    const usdFor = (c: Currency): number => {
      if (c === Currency.ETHER || c === ETHER) {
        return nativeBalance && nativeUsd ? Number(nativeBalance.toExact()) * nativeUsd : 0
      }
      if (c instanceof Token) {
        const bal = balances[c.address]
        // getPythPricesBatch keys are normalized lowercase; sources of
        // `c.address` come from validateAndParseAddress (EIP-55 checksum
        // case) so we lowercase at the lookup site.
        const price = usdByAddress[c.address.toLowerCase()]
        return bal && price ? Number(bal.toExact()) * price : 0
      }
      return 0
    }
    return [...heldList].sort((a, b) => usdFor(b) - usdFor(a))
  }, [heldList, balances, usdByAddress, nativeBalance, nativeUsd])

  const itemData: (Currency | string | undefined)[] = useMemo(() => {
    const list: (Currency | string | undefined)[] = []
    // Native row only goes into "All tokens" if the user doesn't already hold
    // it (otherwise it's already in heldSorted via hasNative).
    const ethRow = showETH && !hasNative ? [Currency.ETHER] : []
    if (heldSorted.length > 0) {
      list.push(HEADER_HELD, ...heldSorted)
      const restWithEth = [...ethRow, ...restList]
      if (restWithEth.length > 0) list.push(HEADER_REST, ...restWithEth)
    } else {
      list.push(...ethRow, ...restList)
    }
    if (inactiveCurrencies.length > 0) {
      list.push(undefined, ...inactiveCurrencies)
    }
    return list
  }, [heldSorted, restList, showETH, hasNative, inactiveCurrencies])

  const Row = useCallback(
    ({ data, index, style }: any) => {
      const item = data[index]
      if (item === HEADER_HELD) return <SectionHeader style={style} label="Your tokens" />
      if (item === HEADER_REST) return <SectionHeader style={style} label="All tokens" />
      if (item === undefined || !item) return null

      const currency: Currency = item as Currency
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
      const handleSelect = () => onCurrencySelect(currency)

      const token = wrappedCurrency(currency, chainId)
      const showImport = inactiveTokens && token && Object.keys(inactiveTokens).includes(token.address)

      if (showImport && token) {
        return (
          <ImportRow
            style={style}
            token={token}
            showImportView={showImportView}
            setImportToken={setImportToken}
            dim={true}
          />
        )
      }

      let usdValue: number | undefined
      if (currency instanceof Token) {
        const bal = balances[currency.address]
        const price = usdByAddress[currency.address.toLowerCase()]
        if (bal && price) usdValue = Number(bal.toExact()) * price
      } else if (currency === Currency.ETHER || currency === ETHER) {
        if (nativeBalance && nativeUsd) usdValue = Number(nativeBalance.toExact()) * nativeUsd
      }

      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          usdValue={usdValue}
        />
      )
    },
    [
      chainId,
      inactiveTokens,
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
      balances,
      usdByAddress,
      nativeBalance,
      nativeUsd,
    ],
  )

  const itemKey = useCallback((index: number, data: any) => {
    const item = data[index]
    if (typeof item === 'string') return `header-${item}`
    if (!item) return `break-${index}`
    return currencyKey(item)
  }, [])

  // Header rows are short (~36px) so they sit close to the row that follows
  // them; currency rows keep the existing 68px height. VariableSizeList caches
  // sizes by index — reset whenever the data identity changes.
  const itemSize = useCallback(
    (index: number) => {
      const item = itemData[index]
      if (typeof item === 'string') return 36
      if (!item) return 0
      return 68
    },
    [itemData],
  )

  const variableListRef = useRef<VariableSizeList>(null)
  useEffect(() => {
    variableListRef.current?.resetAfterIndex(0)
  }, [itemData])

  return (
    <VariableSizeList
      height={height}
      ref={variableListRef}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={itemSize}
      estimatedItemSize={68}
      itemKey={itemKey}
    >
      {Row}
    </VariableSizeList>
  )
}
