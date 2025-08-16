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
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    axisLine={{ stroke: '#FFFA' }}
                    tick={{ fill: '#FFFA' }}
                    tickLine={{ stroke: '#FFFA' }}
                  />
                  <YAxis
                    width={40}
                    axisLine={{ stroke: '#FFFA' }}
                    tick={{ fill: '#FFFA' }}
                    tickLine={{ stroke: '#FFFA' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => {
                      if (value === 'lpPrice') return 'LP Price'
                      if (value === 'bnhPrice') return 'BnH Price'
                      return value
                    }}
                  />
                  <Line type="monotone" dataKey="lpPrice" stroke="#8884d8" />
                  <Line type="monotone" dataKey="bnhPrice" stroke="#82ca9d" />
                </LineChart>
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow-md border flex flex-col gap-1">
        <p className="text-sm text-gray-600">Date: {label}</p>
        <p className="text-sm" style={{ color: '#8884d8' }}>
          LP Price: ${Number(payload[0].value).toFixed(2)}
        </p>
        <p className="text-sm" style={{ color: '#82ca9d' }}>
          BnH Price: ${Number(payload[1].value).toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

export { PairChartModal }
