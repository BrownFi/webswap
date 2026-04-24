import { Currency } from '@brownfi/sdk'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { formatNumber } from 'utils/prices'

type Props = {
  currency0: Currency | undefined
  currency1: Currency | undefined
  symbol0: string
  symbol1: string
  reserve0: number
  reserve1: number
  price0: number
  price1: number
  compact?: boolean
}

/**
 * Horizontal pool balance breakdown — token amounts + % split bar.
 * Pair colors mirror the Pool Detail page (orange left, blue right).
 */
export function PoolBalanceBar({
  currency0,
  currency1,
  symbol0,
  symbol1,
  reserve0,
  reserve1,
  price0,
  price1,
  compact,
}: Props) {
  const value0 = reserve0 * price0
  const value1 = reserve1 * price1
  const total = value0 + value1

  if (total <= 0) return null

  const pct0 = (value0 / total) * 100
  const pct1 = 100 - pct0

  if (compact) {
    return (
      <div className="flex flex-col gap-1 w-full max-w-[360px]">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1 min-w-0"
            style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11, color: '#978A80' }}
          >
            <CurrencyLogo currency={currency0} size="12px" />
            <span className="truncate">
              {formatNumber(reserve0, { maximumFractionDigits: 2 })} {symbol0}
            </span>
          </span>
          <span
            className="inline-flex items-center gap-1 min-w-0 justify-end"
            style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11, color: '#978A80' }}
          >
            <span className="truncate">
              {formatNumber(reserve1, { maximumFractionDigits: 2 })} {symbol1}
            </span>
            <CurrencyLogo currency={currency1} size="12px" />
          </span>
        </div>
        <div
          className="flex w-full overflow-hidden rounded-full"
          style={{ height: 4, background: '#2F2823' }}
        >
          <div style={{ width: `${pct0}%`, background: '#D8A072' }} />
          <div style={{ width: `${pct1}%`, background: '#6FB3E6' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#978A80' }}>
        Pool balances
      </span>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <CurrencyLogo currency={currency0} size="20px" />
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: '#FBFBFD' }}>
            {formatNumber(reserve0, { maximumFractionDigits: 2 })} {symbol0}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: '#FBFBFD' }}>
            {formatNumber(reserve1, { maximumFractionDigits: 2 })} {symbol1}
          </span>
          <CurrencyLogo currency={currency1} size="20px" />
        </div>
      </div>

      <div
        className="flex w-full overflow-hidden rounded-full"
        style={{ height: 8, background: '#2F2823' }}
      >
        <div style={{ width: `${pct0}%`, background: '#D8A072' }} />
        <div style={{ width: `${pct1}%`, background: '#6FB3E6' }} />
      </div>

      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: '#D8A072' }}>
          {pct0.toFixed(1)}%
        </span>
        <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: '#6FB3E6' }}>
          {pct1.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
