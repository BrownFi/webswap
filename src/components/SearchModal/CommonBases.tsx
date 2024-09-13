import React from 'react'
import { Text } from 'rebass'
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@brownfi/sdk'
import styled from 'styled-components'

import { SUGGESTED_BASES } from '../../constants'
import { AutoRow } from '../Row'
import CurrencyLogo from '../CurrencyLogo'
import { getTokenSymbol } from 'utils'

const BaseWrapper = styled.div<{ disable?: boolean }>`
  border: 0;
  border-radius: 0;
  display: flex;
  padding: 0 12px;
  height: 34px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
  }

  background-color: #1d1c21;
  opacity: ${({ disable }) => disable && '0.6'};
`

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency
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
          {chainId === ChainId.BSC_TESTNET ? 'BNB' : chainId === ChainId.SEPOLIA ? 'ETH' : 'VIC'}
        </Text>
      </BaseWrapper>
      {(chainId ? SUGGESTED_BASES[chainId] : []).map((token: Token) => {
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
