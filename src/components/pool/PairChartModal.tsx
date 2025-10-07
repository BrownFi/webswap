import { Pair } from '@brownfi/sdk'
import { Card } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { Modal } from 'components/Modal'
import QuestionHelper from 'components/QuestionHelper'
import { isMainnet } from 'connectors'
import moment from 'moment'
import { ReactNode, useMemo, useState } from 'react'
import { BarChart2 } from 'react-feather'
import { Flex, Text } from 'rebass'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import useSWR from 'swr'
import { formatNumber, formatPrice } from 'utils/prices'
import { graphqlFetcher } from 'utils/swr'

const GET_PAIR_STATS = `
  query PairStats($chainId: Int, $address: String) {
    pairDayDatas(
      limit: 1000
      where: {chainId: $chainId, address: $address}
      orderBy: "startUnix"
      orderDirection: "asc"
    ) {
      items {
        chainId
        address
        startUnix
        tvl
        totalVolume
        totalFee
        apr
        lpPrice
        bnhPrice
      }
    }
  }
`

type Props = {
  pair: Pair
  name: ReactNode
}

const PairChartModal = ({ pair, name }: Props) => {
  const [isOpen, setOpen] = useState(false)

  const { data } = useSWR<{
    pairDayDatas: {
      totalCount: number
      items: {
        chainId: number
        address: string
        startUnix: number
        tvl: number
        totalVolume: number
        totalFee: number
        apr: number
        lpPrice: number
        bnhPrice: number
      }[]
    }
  }>(
    isOpen ? [pair.chainId, pair.liquidityToken.address] : null,
    ([chainId, address]) =>
      graphqlFetcher({
        operationName: 'PairStats',
        query: GET_PAIR_STATS,
        variables: { chainId, address: address },
      }),
    {
      refreshInterval: 1 * 60 * 1000,
    },
  )

  const isHYPEUSDT = pair.liquidityToken.address === '0x122524E1c403739bd33Ec54d606DDc287117B0A6' // HYPE/USD₮0

  const chartData = useMemo(() => {
    return (
      data?.pairDayDatas.items
        .map((item) => {
          return {
            ...item,
            date: moment.unix(item.startUnix).format('DD/MM'),
            bnhPrice: item.bnhPrice,
          }
        })
        .filter((item) => {
          if (isHYPEUSDT) {
            // return moment.unix(item.startUnix) > moment('2025-08-12')
          }
          return true
        }) ?? []
    )
  }, [data, isHYPEUSDT])

  return (
    <>
      <div title="View chart" className="cursor-pointer" onClick={() => setOpen(true)}>
        <BarChart2 size="20" style={{ color: '#27E3AB' }} />
      </div>

      <Modal isOpen={isOpen} onDismiss={() => setOpen(false)} maxWidth={800}>
        <Card className="md:!p-6 !p-3">
          <AutoColumn gap="lg">
            <Flex sx={{ gap: '4px' }} alignItems="flex-end">
              <Text fontSize={18} color={'white'} fontFamily={'Russo One'}>
                {name}
              </Text>
              <QuestionHelper
                text={`This analysis benchmarks the overall performance of the pool (not individual users). By tokenizing both the liquidity provision (LP) position and the passive holding two tokens (HODL) strategy, the chart tracks the LP token's value relative to a synthetic 'HODL token.`}
              />
            </Flex>

            <div className="w-full h-[400px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
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
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    hide={true}
                    domain={[0, (dataMax: number) => dataMax * 4]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Line type="monotone" dataKey="lpPrice" stroke="#FFB347" yAxisId="left" />
                  {!isMainnet && <Line type="monotone" dataKey="bnhPrice" stroke="#4DA3FF" yAxisId="left" />}
                  <Bar dataKey="totalVolume" fill="#66CC99" barSize={20} yAxisId="right" />
                </ComposedChart>
              </ResponsiveContainer>

              {data?.pairDayDatas.items.length === 0 && (
                <div className="absolute inset-0 flex justify-center items-center">
                  <Text fontSize={18} color="#FFFA" fontFamily={'Russo One'}>
                    No Data
                  </Text>
                </div>
              )}
            </div>
          </AutoColumn>
        </Card>
      </Modal>
    </>
  )
}

const CustomLegend = ({ payload, onClick }: any) => {
  const items = (payload ?? []).filter((it: any) => it.value !== 'totalVolume')
  return (
    <div className="flex items-center justify-center gap-4">
      {items.map((it: any) => (
        <div className="flex gap-1.5 items-center" key={String(it.value)} onClick={() => onClick?.(it)}>
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
            {it.value === 'lpPrice' ? 'LP Price' : it.value === 'bnhPrice' ? 'HODL Price' : String(it.value)}
          </Text>
        </div>
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow-md border flex flex-col gap-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-sm" style={{ color: '#FFB347' }}>
          LP Price: {formatPrice(payload[0].value, { maximumFractionDigits: isMainnet ? 2 : 5 })}
        </p>
        {!isMainnet && (
          <p className="text-sm" style={{ color: '#4DA3FF' }}>
            HODL Price: {formatPrice(payload[1].value, { maximumFractionDigits: isMainnet ? 2 : 5 })}
          </p>
        )}
        <p className="text-sm" style={{ color: '#66CC99' }}>
          Volume: {formatPrice((payload[2] || payload[1]).value)}
        </p>
      </div>
    )
  }
  return null
}

export { PairChartModal }
