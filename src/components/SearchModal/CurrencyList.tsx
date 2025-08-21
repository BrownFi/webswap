import { Currency, CurrencyAmount, currencyEquals, ETHER, Token } from '@brownfi/sdk'
import Column from 'components/Column'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { Loader } from 'components/Loader'
import { RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { useActiveWeb3React } from 'hooks'
import { useAllInactiveTokens, useIsUserAddedToken } from 'hooks/Tokens'
import useTheme from 'hooks/useTheme'
import { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import { useCombinedActiveList, WrappedTokenInfo } from 'state/lists/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { getTokenName, getTokenSymbol, isTokenOnList } from 'utils'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import ImportRow from './ImportRow'
import { MenuItem } from './styleds'

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
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
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
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
      </RowFixed>
    </MenuItem>
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
  const itemData: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = showETH ? [Currency.ETHER, ...currencies] : currencies
    if (breakIndex !== undefined) {
      formatted = [...formatted.slice(0, breakIndex), undefined, ...formatted.slice(breakIndex, formatted.length)]
    }
    return formatted
  }, [breakIndex, currencies, showETH])

  const { chainId } = useActiveWeb3React()
  const theme = useTheme()

  const inactiveTokens: {
    [address: string]: Token
  } = useAllInactiveTokens()

  const Row = useCallback(
    ({ data, index, style }: any) => {
      const currency: Currency = data[index]
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
      const handleSelect = () => onCurrencySelect(currency)

      const token = wrappedCurrency(currency, chainId)

      const showImport = inactiveTokens && token && Object.keys(inactiveTokens).includes(token.address)

      if (index === breakIndex || !data) {
        return null
      }

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
      } else {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
          />
        )
      }
    },
    [
      chainId,
      inactiveTokens,
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
      breakIndex,
      theme.text1,
    ],
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={68}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
