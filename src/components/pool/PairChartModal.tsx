import { Pair } from '@brownfi/sdk'
import { Card } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { Modal } from 'components/Modal'
import QuestionHelper from 'components/QuestionHelper'
import { isMainnet } from 'connectors'
import dayjs from 'dayjs'
import { memo, ReactNode, useEffect, useMemo, useState } from 'react'
import { BarChart2 } from 'react-feather'
import { Flex, Text } from 'components/Rebass'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { formatNumber, formatPrice } from 'utils/prices'
import { graphqlFetcher } from 'utils/graphql'

const GET_PAIR_STATS = `
  query PairStats($pair: String) {
    pairDayDatas(
      first: 1000
      where: {pair: $pair}
      orderBy: dayStartUnix
      orderDirection: asc
    ) {
      pair {
        id
      }
      dayStartUnix
      tvl
      totalVolume
      totalFee
      apr
      lpPrice
      bnhPrice
    }
  }
`

type Props = {
  pair: Pair
  name: ReactNode
  enableAdvancedZoom?: boolean
  inline?: boolean
}

const PairChartModalInner = ({ pair, name, enableAdvancedZoom, inline }: Props) => {
  const [isOpen, setOpen] = useState(false)
  const [zoomRange, setZoomRange] = useState<{ startIndex: number; endIndex: number } | null>(null)
  const [selection, setSelection] = useState<{ startIndex: number; endIndex: number } | null>(null)
  const showExtendedMetrics = !isMainnet

  const { data, isPending } = useQuery<{
    pairDayDatas: {
      dayStartUnix: number
      tvl: number
      totalVolume: number
      totalFee: number
      apr: number
      lpPrice: number
      bnhPrice: number
    }[]
  }>({
    queryKey: ['pairStats', pair.chainId, pair.liquidityToken.address, pair.version],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairStats',
        query: GET_PAIR_STATS,
        variables: { chainId: pair.chainId, version: pair.version, pair: pair.liquidityToken.address.toLowerCase() },
      }),
    enabled: inline || isOpen,
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  const isHYPEUSDT = pair.liquidityToken.address === '0x122524E1c403739bd33Ec54d606DDc287117B0A6' // HYPE/USD₮0
  const iskHYPEUSDT = pair.liquidityToken.address === '0xBb78f5ad054CAC4274813b6A4BBcC47D75a18BC3' // HYPE/USD₮0

  const chartData = useMemo(() => {
    return (
      data?.pairDayDatas
        .map((item) => {
          return {
            ...item,
            date: dayjs.unix(item.dayStartUnix).format('DD/MM'),
            lpPrice: iskHYPEUSDT ? item.lpPrice / 1e9 : item.lpPrice,
            bnhPrice: iskHYPEUSDT ? item.bnhPrice / 1e9 : item.bnhPrice,
            netPnL: item.tvl - (item.bnhPrice * item.tvl) / item.lpPrice,
            formattedTvl: item.tvl / 10,
          }
        })
        .filter((item) => {
          if (isHYPEUSDT) {
            return dayjs.unix(item.dayStartUnix).isAfter(dayjs('2025-08-09'))
          }
          if (iskHYPEUSDT) {
            return dayjs.unix(item.dayStartUnix).isAfter(dayjs('2025-11-22'))
          }
          return true
        }) ?? []
    )
  }, [data, isHYPEUSDT, iskHYPEUSDT])

  const defaultRange = useMemo(() => {
    if (!chartData.length) {
      return null
    }

    const endIndex = chartData.length - 1
    return {
      startIndex: Math.max(endIndex - 29, 0),
      endIndex,
    }
  }, [chartData])

  useEffect(() => {
    if (!enableAdvancedZoom) {
      setSelection(null)
    }
  }, [enableAdvancedZoom])

  useEffect(() => {
    if (!enableAdvancedZoom) {
      setZoomRange(null)
      return
    }

    if (!chartData.length) {
      setZoomRange(null)
      return
    }

    setZoomRange((prev) => {
      if (prev) {
        return prev
      }

      return defaultRange
    })
  }, [chartData, defaultRange, enableAdvancedZoom])

  const displayedData = useMemo(() => {
    if (!zoomRange || !chartData.length) {
      return chartData
    }

    const { startIndex, endIndex } = zoomRange
    if (startIndex <= 0 && endIndex >= chartData.length - 1) {
      return chartData
    }

    return chartData.slice(startIndex, endIndex + 1)
  }, [chartData, zoomRange])

  const displayedDataLength = displayedData.length

  const lineDotConfig = useMemo(() => {
    if (displayedDataLength > 30) {
      return { dot: false as const, activeDot: { r: 2, strokeWidth: 1 } }
    } else {
      return { dot: { r: 3, strokeWidth: 1 }, activeDot: { r: 4, strokeWidth: 1 } }
    }
  }, [displayedDataLength])

  const displayedOffset = useMemo(() => {
    if (!zoomRange) {
      return 0
    }
    return zoomRange.startIndex
  }, [zoomRange])

  const isDefaultRangeActive = useMemo(() => {
    if (!enableAdvancedZoom || !defaultRange || !zoomRange) {
      return false
    }

    return zoomRange.startIndex === defaultRange.startIndex && zoomRange.endIndex === defaultRange.endIndex
  }, [defaultRange, enableAdvancedZoom, zoomRange])

  const toGlobalIndex = (indexInDisplay: number) => {
    const candidate = displayedOffset + indexInDisplay
    if (candidate >= 0 && candidate < chartData.length) {
      return candidate
    }
    const dataPoint = displayedData[indexInDisplay]
    if (!dataPoint) {
      return null
    }
    const fallback = chartData.indexOf(dataPoint)
    return fallback === -1 ? null : fallback
  }

  const getIndexFromState = (chartState: Record<string, any> | null) => {
    if (!enableAdvancedZoom) {
      return null
    }

    if (!chartState) {
      return null
    }

    const { activeTooltipIndex, activeLabel, activePayload, xAxisMap, chartX } = chartState

    if (typeof activeTooltipIndex === 'number' && activeTooltipIndex >= 0) {
      const idx = toGlobalIndex(activeTooltipIndex)
      if (idx != null) {
        return idx
      }
    }

    const payload = activePayload?.[0]?.payload
    if (payload) {
      const idx = chartData.indexOf(payload)
      if (idx !== -1) {
        return idx
      }
    }

    if (activeLabel != null) {
      const idx = chartData.findIndex((item) => item.date === activeLabel)
      if (idx !== -1) {
        return idx
      }
    }

    const axis = xAxisMap?.date
    if (axis && typeof chartX === 'number') {
      const { ticks = [], scale, bandwidth = 0 } = axis
      if (typeof scale === 'function' && ticks.length) {
        let closestIdx = 0
        let minDiff = Infinity
        ticks.forEach((tick: any, idx: number) => {
          const center = scale(tick.value) + bandwidth / 2
          const diff = Math.abs(center - chartX)
          if (diff < minDiff) {
            minDiff = diff
            closestIdx = idx
          }
        })

        const tickValue = ticks[closestIdx]?.value
        if (tickValue != null) {
          const idx = chartData.findIndex((item) => item.date === tickValue)
          if (idx !== -1) {
            return idx
          }
        }
      }
    }

    return null
  }

  const handleMouseDown = (state: Record<string, any>) => {
    if (!enableAdvancedZoom) {
      return
    }
    const idx = getIndexFromState(state)
    if (idx == null) {
      return
    }

    setSelection({ startIndex: idx, endIndex: idx })
  }

  const handleMouseMove = (state: Record<string, any>) => {
    if (!enableAdvancedZoom) {
      return
    }
    if (!selection) {
      return
    }

    const idx = getIndexFromState(state)
    if (idx == null) {
      return
    }

    setSelection((prev) => (prev ? { ...prev, endIndex: idx } : prev))
  }

  const applyZoomRange = (startIndex: number, endIndex: number) => {
    if (!enableAdvancedZoom) {
      return
    }
    const normalizedStart = Math.max(Math.min(startIndex, endIndex), 0)
    const normalizedEnd = Math.max(startIndex, endIndex, normalizedStart)
    if (normalizedEnd <= normalizedStart) {
      return
    }

    setZoomRange({ startIndex: normalizedStart, endIndex: normalizedEnd })
  }

  const handleMouseUp = () => {
    if (!enableAdvancedZoom) {
      return
    }
    if (!selection) {
      return
    }

    if (selection.startIndex === selection.endIndex) {
      setSelection(null)
      return
    }

    applyZoomRange(selection.startIndex, selection.endIndex)
    setSelection(null)
  }

  const handleMouseLeave = () => {
    if (!enableAdvancedZoom) {
      return
    }
    setSelection(null)
  }

  const handleZoomOut = () => {
    if (!enableAdvancedZoom) {
      return
    }
    setZoomRange(null)
  }

  const handleResetToDefault = () => {
    if (!enableAdvancedZoom) {
      return
    }
    if (!defaultRange) {
      return
    }
    setZoomRange(defaultRange)
  }

  const referenceArea = useMemo(() => {
    if (!enableAdvancedZoom || !selection) {
      return null
    }

    const { startIndex, endIndex } = selection
    const start = Math.min(startIndex, endIndex)
    const end = Math.max(startIndex, endIndex)

    return {
      x1: chartData[start]?.date,
      x2: chartData[end]?.date,
    }
  }, [chartData, selection, enableAdvancedZoom])

  const chartBody = (
    <Card className="md:!p-6 !p-3">
      <AutoColumn gap="lg">
        <Flex sx={{ gap: '4px' }} alignItems="flex-end">
          <Text fontSize={18} color={'white'} fontFamily={'Inter'}>
            {name}
          </Text>
          {showExtendedMetrics && (
            <QuestionHelper
              text={`This analysis benchmarks the overall performance of the pool (not individual users). By tokenizing both the liquidity provision (LP) position and the passive holding two tokens (HODL) strategy, the chart tracks the LP token's value relative to a synthetic 'HODL' token.`}
            />
          )}
        </Flex>

        <div className="w-full h-[400px] relative">
              {enableAdvancedZoom && (
                <div className="absolute right-3 top-3 flex gap-2 z-10">
                  <button
                    className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition disabled:opacity-40"
                    onClick={handleZoomOut}
                    disabled={!zoomRange}
                  >
                    All
                  </button>
                  <button
                    className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition disabled:opacity-40"
                    onClick={handleResetToDefault}
                    disabled={!defaultRange || isDefaultRangeActive}
                  >
                    Last 30D
                  </button>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displayedData}
                  onMouseDown={enableAdvancedZoom ? handleMouseDown : undefined}
                  onMouseMove={enableAdvancedZoom ? handleMouseMove : undefined}
                  onMouseUp={enableAdvancedZoom ? handleMouseUp : undefined}
                  onMouseLeave={enableAdvancedZoom ? handleMouseLeave : undefined}
                  style={{ cursor: enableAdvancedZoom ? (selection ? 'grabbing' : 'crosshair') : 'default' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    axisLine={{ stroke: '#FFFA' }}
                    tick={{ fill: '#FFFA' }}
                    tickLine={{ stroke: '#FFFA' }}
                  />
                  <YAxis
                    yAxisId="left"
                    width={40}
                    axisLine={{ stroke: '#FFFA' }}
                    tick={{ fill: '#FFFA' }}
                    domain={[0, (dataMax: number) => +(dataMax * 1.1).toFixed(1)]}
                    tickLine={{ stroke: '#FFFA' }}
                    tickFormatter={(value: number) =>
                      formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                    }
                  />
                  {showExtendedMetrics && (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      width={60}
                      axisLine={{ stroke: '#FFFA' }}
                      tick={{ fill: '#FFFA' }}
                      tickLine={{ stroke: '#FFFA' }}
                      // allow negative/positive net PnL values and add a small margin
                      // expand bounds by 10% and ensure axis crosses zero when data is one-sided
                      domain={[
                        (dataMin: number) => {
                          const min = typeof dataMin === 'number' && !Number.isNaN(dataMin) ? dataMin : 0
                          // if there's any negative values, make lower bound slightly more negative
                          const lower = Math.min(min * 1.1, 0)
                          return +lower.toFixed(1)
                        },
                        (dataMax: number) => {
                          const max = typeof dataMax === 'number' && !Number.isNaN(dataMax) ? dataMax : 0
                          // if there's any positive values, make upper bound slightly larger
                          const upper = Math.max(max * 1.1, 0)
                          return +upper.toFixed(1)
                        },
                      ]}
                      // show ticks rounded to 1 decimal
                      tickFormatter={(value: number) =>
                        formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                      }
                    />
                  )}
                  {/* hidden axis for volume so bars don't share other scales */}
                  <YAxis
                    yAxisId="volume"
                    orientation="right"
                    hide={true}
                    domain={[0, (dataMax: number) => dataMax * 4]}
                  />
                  <Tooltip content={<CustomTooltip showExtendedMetrics={showExtendedMetrics} />} />
                  <Legend content={<CustomLegend showExtendedMetrics={showExtendedMetrics} />} />
                  <Line
                    type="monotone"
                    dataKey="lpPrice"
                    stroke="#FFB347"
                    yAxisId="left"
                    isAnimationActive={false}
                    {...lineDotConfig}
                  />
                  {showExtendedMetrics && (
                    <Line
                      type="monotone"
                      dataKey="bnhPrice"
                      stroke="#4DA3FF"
                      yAxisId="left"
                      isAnimationActive={false}
                      {...lineDotConfig}
                    />
                  )}
                  {showExtendedMetrics && (
                    <Line
                      type="monotone"
                      dataKey="formattedTvl"
                      stroke="#DA70D6"
                      yAxisId="right"
                      isAnimationActive={false}
                      {...lineDotConfig}
                    />
                  )}
                  <Bar dataKey="totalVolume" fill="#66CC99" barSize={20} yAxisId="volume" isAnimationActive={false} />
                  {showExtendedMetrics && (
                    <Line
                      type="monotone"
                      dataKey="netPnL"
                      stroke="#EE4B2B"
                      yAxisId="right"
                      isAnimationActive={false}
                      {...lineDotConfig}
                    />
                  )}
                  {enableAdvancedZoom && referenceArea?.x1 && referenceArea?.x2 && (
                    <ReferenceArea
                      x1={referenceArea.x1}
                      x2={referenceArea.x2}
                      fill="#c4943a"
                      stroke="#c4943a"
                      fillOpacity={0.35}
                      strokeOpacity={0.9}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      yAxisId="left"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>

          {isPending && (
            <div className="absolute inset-0 flex justify-center items-center">
              <Text fontSize={18} color="#FFFA" fontFamily={'Inter'}>
                Loading...
              </Text>
            </div>
          )}
          {!isPending && data?.pairDayDatas.length === 0 && (
            <div className="absolute inset-0 flex justify-center items-center">
              <Text fontSize={18} color="#FFFA" fontFamily={'Inter'}>
                No Data
              </Text>
            </div>
          )}
        </div>
      </AutoColumn>
    </Card>
  )

  if (inline) {
    return chartBody
  }

  return (
    <>
      <div title="View chart" className="cursor-pointer" onClick={() => setOpen(true)}>
        <BarChart2 size="20" style={{ color: '#c4943a' }} />
      </div>
      <Modal isOpen={isOpen} onDismiss={() => setOpen(false)} maxWidth={800}>
        {chartBody}
      </Modal>
    </>
  )
}

const PairChartModal = memo(PairChartModalInner, (prev, next) => {
  return (
    prev.pair.liquidityToken.address === next.pair.liquidityToken.address &&
    prev.pair.chainId === next.pair.chainId &&
    prev.enableAdvancedZoom === next.enableAdvancedZoom &&
    prev.inline === next.inline
  )
})

interface LegendItem {
  value: string
  color: string
}

const CustomLegend = ({
  payload,
  onClick,
  showExtendedMetrics,
}: {
  payload?: LegendItem[]
  onClick?: (item: LegendItem) => void
  showExtendedMetrics: boolean
}) => {
  const allowedKeys = showExtendedMetrics
    ? ['lpPrice', 'bnhPrice', 'netPnL', 'formattedTvl', 'totalVolume']
    : ['lpPrice', 'totalVolume']
  const items = (payload ?? []).filter((it) => allowedKeys.includes(it.value))
  return (
    <div className="flex items-center justify-center gap-4">
      {items.map((it) => (
        <div className="flex gap-1.5 items-center" key={it.value} onClick={() => onClick?.(it)}>
          <span
            style={{
              width: 14,
              height: 14,
              background: it.color,
              borderRadius: 4,
              marginBottom: 2,
            }}
          />
          <Text color="#FFFA">
            {it.value === 'lpPrice'
              ? 'LP Price'
              : it.value === 'bnhPrice'
              ? 'HODL Price'
              : it.value === 'netPnL'
              ? 'Net PnL'
              : it.value === 'formattedTvl'
              ? 'TVL'
              : it.value === 'totalVolume'
              ? 'Volume'
              : String(it.value)}
          </Text>
        </div>
      ))}
    </div>
  )
}

interface TooltipPayloadItem {
  dataKey: string
  value: number
}

const CustomTooltip = ({
  active,
  payload,
  label,
  showExtendedMetrics,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  showExtendedMetrics: boolean
}) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const byKey = Object.fromEntries(payload.map((item) => [item.dataKey, item.value]))
  const lpPrice = byKey['lpPrice'] ?? 0
  const hodlPrice = byKey['bnhPrice'] ?? 0
  const tvl = byKey['formattedTvl'] ?? 0
  const netPnL = byKey['netPnL'] ?? 0
  const volume = byKey['totalVolume'] ?? 0

  return (
    <div className="bg-white p-2 rounded shadow-md border flex flex-col gap-1">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-sm" style={{ color: '#FFB347' }}>
        LP Price: {formatPrice(lpPrice, { maximumFractionDigits: isMainnet ? 2 : 5 })}
      </p>
      {showExtendedMetrics && (
        <p className="text-sm" style={{ color: '#4DA3FF' }}>
          HODL Price: {formatPrice(hodlPrice, { maximumFractionDigits: 5 })}
        </p>
      )}
      {showExtendedMetrics && (
        <>
          <p className="text-sm" style={{ color: '#DA70D6' }}>
            TVL: {formatPrice(tvl, { maximumFractionDigits: isMainnet ? 2 : 5 })}
          </p>
          <p className="text-sm" style={{ color: '#EE4B2B' }}>
            Net PnL: {formatPrice(netPnL, { maximumFractionDigits: isMainnet ? 2 : 5 })}
          </p>
        </>
      )}
      <p className="text-sm" style={{ color: '#66CC99' }}>
        Volume: {formatPrice(volume, { maximumFractionDigits: isMainnet ? 2 : 5 })}
      </p>
    </div>
  )
}

export { PairChartModal }
