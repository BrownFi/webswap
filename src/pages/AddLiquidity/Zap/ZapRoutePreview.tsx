import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { KyberZapRouteData } from './zapHelpers'
import { formatNumber, formatPrice } from 'utils/prices'
import { Loader } from 'components/Loader'

type ZapRoutePreviewProps = {
  /** Kyber zap routeSummary — when provided, USD/impact figures are
   *  extracted from zapDetails. Used by V2 ZapForm + V2 RemoveLiquidity. */
  routeData?: KyberZapRouteData
  /** Direct USD values — used by V3ZapForm which synthesizes them from
   *  Pyth + pool reserves (native quote has no USD-denominated fields).
   *  When set, these override the routeData-derived values. */
  initialUsd?: number
  finalUsd?: number
  /** Already-percentage form (e.g. 0.42 means 0.42%, not 42%). */
  priceImpactPct?: number
}

const formatPercent = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '-'
  }
  return `${formatNumber(value, { maximumFractionDigits: 2 })}%`
}

export const ZapRoutePreview = ({ routeData, initialUsd, finalUsd, priceImpactPct }: ZapRoutePreviewProps) => {
  // Prefer explicit USD/impact props when supplied (V3 native path); fall
  // back to extracting from Kyber's routeData (V2). Kyber ships priceImpact
  // as a fraction (0..1) — normalize to a percentage so the column
  // displays consistently regardless of source.
  const explicit = initialUsd !== undefined || finalUsd !== undefined || priceImpactPct !== undefined
  const initial = explicit ? initialUsd : routeData ? Number(routeData.zapDetails?.initialAmountUsd ?? 0) : undefined
  const final = explicit ? finalUsd : routeData ? Number(routeData.zapDetails?.finalAmountUsd ?? 0) : undefined
  const rawImpact = explicit ? priceImpactPct : routeData ? Number(routeData.zapDetails?.priceImpact) : undefined
  // Kyber returns priceImpact in the 0..1 fraction; V3 ships it already as
  // a percentage. Detect by magnitude: anything <= 1 is treated as fraction.
  const impactPct = rawImpact === undefined || Number.isNaN(rawImpact)
    ? undefined
    : Math.abs(rawImpact) <= 1
      ? rawImpact * 100
      : rawImpact
  const hasData = initial !== undefined && final !== undefined && impactPct !== undefined

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
            {hasData ? formatPrice(initial!) : <Loader stroke="gray" />}
          </span>
        </RowBetween>
        <RowBetween>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            Estimated value after zap
          </span>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            {hasData ? formatPrice(final!) : <Loader stroke="gray" />}
          </span>
        </RowBetween>
        <RowBetween>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            Price impact
          </span>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#C4B89A' }}>
            {hasData ? formatPercent(impactPct!) : <Loader stroke="gray" />}
          </span>
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
