import { useContext } from 'react'

import { Currency, Percent, Price } from '@brownfi/sdk'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'

import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

import { useActiveWeb3React } from 'hooks'
import { Field } from 'state/mint/actions'

import { ONE_BIPS } from 'constants/common'
import { getTokenSymbol } from 'utils'

import { TYPE } from 'theme'

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price,
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
}) {
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  return (
    <AutoColumn gap="md">
      <AutoRow justify="space-around" gap="4px">
        <AutoColumn justify="center">
          <TYPE.black>{price?.toSignificant(6) ?? '-'}</TYPE.black>
          <Text fontWeight={500} fontSize={14} color={theme.white} pt={1} opacity={0.6}>
            {getTokenSymbol(currencies[Field.CURRENCY_B], chainId)} per{' '}
            {getTokenSymbol(currencies[Field.CURRENCY_A], chainId)}
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <TYPE.black>{price?.invert()?.toSignificant(6) ?? '-'}</TYPE.black>
          <Text fontWeight={500} fontSize={14} color={theme.white} pt={1} opacity={0.6}>
            {getTokenSymbol(currencies[Field.CURRENCY_A], chainId)} per{' '}
            {getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <TYPE.black>
            {noLiquidity && price
              ? '100'
              : ((poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0')}
            %
          </TYPE.black>
          <Text fontWeight={500} fontSize={14} color={theme.white} pt={1} opacity={0.6}>
            Share of Pool
          </Text>
        </AutoColumn>
      </AutoRow>
    </AutoColumn>
  )
}
