import { useMemo } from 'react'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { KyberZapRouteData } from './zapHelpers'
import { formatNumber, formatPrice } from 'utils/prices'
import { Loader } from 'components/Loader'

type ZapRoutePreviewProps = {
  routeData?: KyberZapRouteData
}

const formatPercent = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '-'
  }
  const normalized = value > 1 ? value : value * 100
  return `${formatNumber(normalized, { maximumFractionDigits: 2 })}%`
}

export const ZapRoutePreview = ({ routeData }: ZapRoutePreviewProps) => {
  const summary = useMemo(() => {
    if (!routeData) {
      return undefined
    }

    const { zapDetails, gasUsd } = routeData

    return {
      initialUsd: formatPrice(Number(zapDetails?.initialAmountUsd ?? 0)),
      finalUsd: formatPrice(Number(zapDetails?.finalAmountUsd ?? 0)),
      priceImpact: formatPercent(Number(zapDetails?.priceImpact)),
      suggestedSlippage: formatPercent(Number(zapDetails?.suggestedSlippage)),
      gasUsd: formatPrice(Number(gasUsd ?? 0)),
    }
  }, [routeData])

  return (
    <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
      <RowBetween>
        <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
          Zap route preview
        </span>
      </RowBetween>

      <AutoColumn gap="8px">
        <RowBetween>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            Initial value (USD)
          </span>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            {summary ? summary.initialUsd : <Loader stroke="gray" />}
          </span>
        </RowBetween>
        <RowBetween>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            Estimated value after zap
          </span>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            {summary ? summary.finalUsd : <Loader stroke="gray" />}
          </span>
        </RowBetween>
        <RowBetween>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            Price impact
          </span>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            {summary ? summary.priceImpact : <Loader stroke="gray" />}
          </span>
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
