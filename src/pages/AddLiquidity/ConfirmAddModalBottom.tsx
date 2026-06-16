import { Currency, CurrencyAmount, Fraction, Percent } from '@brownfi/sdk'
import { ButtonPrimary } from 'components/Button'
import { RowBetween, RowFixed } from 'components/Row'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { Field } from 'state/mint/actions'
import { useActiveWeb3React } from 'hooks'
import { getTokenSymbol } from 'utils'

export function ConfirmAddModalBottom({
  noLiquidity,
  requiresPoolCreation,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  /** True only when this submission will actually deploy the pair contract
   *  (V2 first-mint). V3 pools are pre-deployed by the permissioned factory,
   *  so even on a V3 empty pool the user is just supplying — not creating. */
  requiresPoolCreation?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  const { chainId } = useActiveWeb3React()
  const labelStyle = { fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' } as const
  const valueStyle = { fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' } as const

  return (
    <>
      <RowBetween>
        <span style={labelStyle}>{getTokenSymbol(currencies[Field.CURRENCY_A], chainId)} Deposited</span>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <span style={valueStyle}>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</span>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <span style={labelStyle}>{getTokenSymbol(currencies[Field.CURRENCY_B], chainId)} Deposited</span>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <span style={valueStyle}>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</span>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <span style={labelStyle}>Rates</span>
        <span style={valueStyle}>
          {`1 ${getTokenSymbol(currencies[Field.CURRENCY_A], chainId)} = ${price?.toSignificant(4)} ${getTokenSymbol(currencies[Field.CURRENCY_B], chainId)}`}
        </span>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>
        <span style={valueStyle}>
          {`1 ${getTokenSymbol(currencies[Field.CURRENCY_B], chainId)} = ${price?.invert().toSignificant(4)} ${getTokenSymbol(currencies[Field.CURRENCY_A], chainId)}`}
        </span>
      </RowBetween>
      <RowBetween>
        <span style={labelStyle}>Share of Pool:</span>
        <span style={valueStyle}>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</span>
      </RowBetween>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '16px', color: '#FFFFFF' }}>
          {requiresPoolCreation ? 'Create Pool & Supply' : 'Confirm Supply'}
        </span>
      </ButtonPrimary>
    </>
  )
}
