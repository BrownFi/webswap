import { useContext, useMemo } from 'react'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { ThemeContext } from 'styled-components'
import { KyberZapRouteData } from './zapHelpers'
import { formatNumber, formatPrice } from 'utils/prices'
import { TYPE } from 'theme'
import { Text } from 'components/Rebass'
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
  const theme = useContext(ThemeContext)

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
    <AutoColumn gap="8px">
      <RowBetween>
        <Text className="font-medium text-white" style={{ fontFamily: 'Russo One' }}>
          Zap route preview
        </Text>
      </RowBetween>

      <AutoColumn gap="8px">
        <RowBetween>
          <Text fontWeight={500} fontSize={14} color={theme.white} opacity={0.6}>
            Initial value (USD)
          </Text>
          <TYPE.black fontSize={14}>{summary ? summary.initialUsd : <Loader stroke="gray" />}</TYPE.black>
        </RowBetween>
        <RowBetween>
          <Text fontWeight={500} fontSize={14} color={theme.white} opacity={0.6}>
            Estimated value after zap
          </Text>
          <TYPE.black fontSize={14}>{summary ? summary.finalUsd : <Loader stroke="gray" />}</TYPE.black>
        </RowBetween>
        <RowBetween>
          <Text fontWeight={500} fontSize={14} color={theme.white} opacity={0.6}>
            Price impact
          </Text>
          <TYPE.black fontSize={14}>{summary ? summary.priceImpact : <Loader stroke="gray" />}</TYPE.black>
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
