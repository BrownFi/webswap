/**
 * Recent-tokens pill row for the currency selector. Visual mirror of
 * CommonBases — same chip style, sits below it. Shows the last N tokens
 * the user picked on this chain (tracked via useRecentTokens).
 *
 * Tokens that have been removed from the active list (e.g. the user
 * de-imported them) silently disappear from the row — we resolve each
 * persisted address against `allTokens` and skip any that don't resolve.
 */
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@brownfi/sdk'
import styled from 'styled-components'

import { AutoRow } from 'components/Row'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { useActiveWeb3React } from 'hooks'
import { getNativeToken, getTokenSymbol } from 'utils'

const NATIVE_SENTINEL = 'NATIVE'

const Chip = styled.div<{ disable?: boolean }>`
  border: 1px solid rgba(196, 148, 58, 0.2);
  border-radius: 9999px;
  display: flex;
  padding: 0 12px;
  height: 34px;
  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    border-color: ${({ disable }) => !disable && 'rgba(196, 148, 58, 0.5)'};
  }
  background-color: #1a1510;
  opacity: ${({ disable }) => disable && '0.6'};
  transition: border-color 150ms;
`

const Label = styled.span`
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #978a80;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-right: 4px;
`

interface Props {
  addresses: string[]
  allTokens: { [address: string]: Token }
  onSelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
}

export default function RecentTokens({ addresses, allTokens, onSelect, selectedCurrency }: Props) {
  const { chainId } = useActiveWeb3React()

  const items: Currency[] = addresses
    .map((addr): Currency | undefined => {
      if (addr === NATIVE_SENTINEL) return ETHER
      return allTokens[addr]
    })
    .filter((c): c is Currency => !!c)

  if (items.length === 0) return null

  return (
    <AutoRow gap="6px" style={{ marginTop: 8 }}>
      <Label>Recent</Label>
      {items.map((c, i) => {
        const selected =
          c === ETHER
            ? selectedCurrency === ETHER
            : c instanceof Token &&
              selectedCurrency instanceof Token &&
              currencyEquals(selectedCurrency, c)
        return (
          <Chip
            key={c === ETHER ? NATIVE_SENTINEL : (c as Token).address + i}
            onClick={() => !selected && onSelect(c)}
            disable={selected}
          >
            <CurrencyLogo currency={c} style={{ marginRight: 8 }} size="20px" />
            <span style={{ fontWeight: 500, fontSize: 14, color: 'white', fontFamily: 'Inter, sans-serif' }}>
              {c === ETHER ? getNativeToken(chainId as ChainId) : getTokenSymbol(c as Token, chainId)}
            </span>
          </Chip>
        )
      })}
    </AutoRow>
  )
}
