import { Text } from 'components/Rebass'
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@brownfi/sdk'
import styled from 'styled-components'

import { SUGGESTED_BASES } from 'constants/common'
import { AutoRow } from 'components/Row'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { getNativeToken, getTokenSymbol } from 'utils'

const BaseWrapper = styled.div<{ disable?: boolean }>`
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

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
}: {
  chainId?: ChainId
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  return (
    <AutoRow gap="6px">
      <BaseWrapper
        onClick={() => {
          if (!selectedCurrency || !currencyEquals(selectedCurrency, ETHER)) {
            onSelect(ETHER)
          }
        }}
        disable={selectedCurrency === ETHER}
      >
        <CurrencyLogo currency={ETHER} style={{ marginRight: 8 }} />
        <Text fontWeight={500} fontSize={14} color="white">
          {getNativeToken(chainId as ChainId)}
        </Text>
      </BaseWrapper>
      {(chainId ? SUGGESTED_BASES[chainId] ?? [] : []).map((token: Token) => {
        const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address
        return (
          <BaseWrapper onClick={() => !selected && onSelect(token)} disable={selected} key={token.address}>
            <CurrencyLogo currency={token} style={{ marginRight: 8 }} size="20px" />
            <Text fontWeight={500} fontSize={14} color="white">
              {getTokenSymbol(token, chainId)}
            </Text>
          </BaseWrapper>
        )
      })}
    </AutoRow>
  )
}
