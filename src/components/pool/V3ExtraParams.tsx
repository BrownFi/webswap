import { formatNumberLambda } from 'utils/prices'

// Inline list of the V3-only pool config params (beyond Lambda/Kappa/FeeSplit
// which are shown next to it). Renders as a fragment of <span>s so it wraps
// naturally inside the surrounding flex strip on both pool list rows and the
// pool detail header.
//
// Each field comes from useDevStats's V3 path and may be undefined on V2 (in
// which case the entry is skipped silently).
type DevStatsLike = {
  kQ?: number
  fee?: number
  compress?: number
  sSell?: number
  sBuy?: number
  fixS?: number
  disThreshold?: number
  sBound?: number
  pythWeight?: number
  gamma?: number
}

export function V3ExtraParams({ devStats }: { devStats: DevStatsLike }) {
  const items: { label: string; value: number | undefined }[] = [
    { label: 'kQ', value: devStats.kQ },
    // Fee is already shown as a badge next to the pair title on both Pool
    // List and Pool Detail — listing it again here was redundant noise.
    { label: 'Compress', value: devStats.compress },
    { label: 'sSell', value: devStats.sSell },
    { label: 'sBuy', value: devStats.sBuy },
    { label: 'fixS', value: devStats.fixS },
    { label: 'disThreshold', value: devStats.disThreshold },
    { label: 'sBound', value: devStats.sBound },
    { label: 'pythWeight', value: devStats.pythWeight },
    { label: 'gamma', value: devStats.gamma },
  ]
  return (
    <>
      {items.map(({ label, value }) =>
        value === undefined ? null : (
          <span key={label}>
            {label}: {formatNumberLambda(value, { maximumFractionDigits: 4 })}
          </span>
        ),
      )}
    </>
  )
}
