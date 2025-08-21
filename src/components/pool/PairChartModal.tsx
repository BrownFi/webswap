import { useQuery } from '@apollo/client'
import { Pair } from '@brownfi/sdk'
import { gql } from '__generated__'
import { Card } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { Modal } from 'components/Modal'
import moment from 'moment'
import { ReactNode, useMemo, useState } from 'react'
import { BarChart2 } from 'react-feather'
import { Text } from 'rebass'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatPrice } from 'utils/prices'

const GET_PAIR_STATS = gql(`
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
        netPnL
      }
    }
  }
`)

type Props = {
  pair: Pair
  name: ReactNode
}

const PairChartModal = ({ pair, name }: Props) => {
  const [isOpen, setOpen] = useState(false)

  const { data } = useQuery(GET_PAIR_STATS, {
    variables: { chainId: pair.chainId, address: pair.liquidityToken.address },
    pollInterval: 1 * 60 * 1000,
    skip: !isOpen,
  })

  const chartData = useMemo(() => {
    return (
      data?.pairDayDatas.items.map((item) => {
        return {
          ...item,
          date: moment.unix(item.startUnix).format('DD/MM'),
        }
      }) ?? []
    )
  }, [data])

  return (
    <>
      <div title="View chart" className="cursor-pointer" onClick={() => setOpen(true)}>
        <BarChart2 size="20" style={{ color: '#27E3AB' }} />
      </div>

      <Modal isOpen={isOpen} onDismiss={() => setOpen(false)} maxWidth={800}>
        <Card className="md:!p-6 !p-3">
          <AutoColumn gap="lg">
            <Text fontSize={18} color={'white'} fontFamily={'Russo One'}>
              {name}
            </Text>

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
                    tickLine={{ stroke: '#FFFA' }}
                    domain={[0, (dataMax: number) => dataMax * 1.1]}
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
                  <Line type="monotone" dataKey="bnhPrice" stroke="#4DA3FF" yAxisId="left" />
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
            {it.value === 'lpPrice' ? 'LP Price' : it.value === 'bnhPrice' ? 'BnH Price' : String(it.value)}
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
          LP Price: {formatPrice(payload[0].value)}
        </p>
        <p className="text-sm" style={{ color: '#4DA3FF' }}>
          BnH Price: {formatPrice(payload[1].value)}
        </p>
        <p className="text-sm" style={{ color: '#66CC99' }}>
          Volume: {formatPrice(payload[2].value)}
        </p>
      </div>
    )
  }
  return null
}

export { PairChartModal }
