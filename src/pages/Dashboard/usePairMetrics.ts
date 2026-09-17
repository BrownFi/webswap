import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { VERSION } from 'lib/sdk/constants/addresses'
import { graphqlFetcher } from 'utils/graphql'
import type { DashboardPeriod, RevenueChainRow } from './useRevenueDashboard'

const V3_PAIR_METRICS_QUERY = `
  query DashboardPairMetrics {
    pairs(first: 1000) {
      id
      quoteTokenIndex
      tvl
      volumeDay
      volume7Day
      feeDay
      feeSplit
      apr
      token0 { id symbol name decimals }
      token1 { id symbol name decimals }
    }
    pairDayDatas(first: 1000, orderBy: dayStartUnix, orderDirection: desc) {
      pair { id }
      dayStartUnix
      tvl
      totalVolume
      totalFee
    }
  }
`

const HEMI_SUBGRAPH_URL = import.meta.env.VITE_GRAPH_API_KEY
  ? `https://gateway.thegraph.com/api/${import.meta.env.VITE_GRAPH_API_KEY}/subgraphs/id/D1UwhrB45geUZTNQ2QwrXwGEhk69iBESApJJzz378ZeS`
  : 'https://api.studio.thegraph.com/query/50593/hemi-analytics/version/latest'

const HEMI_PAIR_METRICS_QUERY = `
  query DashboardHemiPairMetrics {
    pools(first: 1000) {
      id
      totalValueLockedUSD
      totalValueLockedToken0
      totalValueLockedToken1
      token0 { id symbol name decimals }
      token1 { id symbol name decimals }
    }
    poolDayDatas(first: 1000, orderBy: date, orderDirection: desc) {
      pool { id }
      date
      tvlUSD
      volumeUSD
      feesUSD
    }
  }
`

type RawDay = { key: string; tvl: number; volume: number; fee: number }
type RawPair = {
  id: string
  quoteTokenIndex?: number
  tvl?: string | number
  volumeDay?: string | number
  volume7Day?: string | number
  feeDay?: string | number
  feeSplit?: string | number
  apr?: string | number
  token0: { id: string; symbol: string; name: string; decimals: number }
  token1: { id: string; symbol: string; name: string; decimals: number }
  days: RawDay[]
  hemi?: boolean
}

export type DashboardPairMetric = {
  id: string
  token0: RawPair['token0']
  token1: RawPair['token1']
  quoteTokenIndex?: number
  tvl: number
  volume: number
  fee: number
  revenue: number
  apr: number
  revenueEstimated: boolean
}

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function fetchV3PairMetrics(chainId: number): Promise<RawPair[]> {
  const data = (await graphqlFetcher({
    operationName: 'DashboardPairMetrics',
    query: V3_PAIR_METRICS_QUERY,
    variables: { chainId, version: VERSION.V3_OFFICIAL },
  })) as { pairs?: RawPair[]; pairDayDatas?: Array<{ pair: { id: string }; dayStartUnix: string | number; tvl: string | number; totalVolume: string | number; totalFee: string | number }> } | null
  const daysByPair = new Map<string, RawDay[]>()
  for (const day of data?.pairDayDatas ?? []) {
    const id = day.pair.id.toLowerCase()
    const days = daysByPair.get(id) ?? []
    days.push({ key: String(day.dayStartUnix), tvl: num(day.tvl), volume: num(day.totalVolume), fee: num(day.totalFee) })
    daysByPair.set(id, days)
  }
  return (data?.pairs ?? []).map((pair) => ({ ...pair, days: daysByPair.get(pair.id.toLowerCase()) ?? [] }))
}

async function fetchHemiPairMetrics(): Promise<RawPair[]> {
  const response = await fetch(HEMI_SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName: 'DashboardHemiPairMetrics', query: HEMI_PAIR_METRICS_QUERY, variables: {} }),
  })
  if (!response.ok) throw new Error(`Hemi API HTTP ${response.status}`)
  const body = await response.json()
  if (body.errors?.length) throw new Error(body.errors.map((error: { message?: string }) => error.message ?? 'Hemi API failed').join('; '))
  const daysByPool = new Map<string, RawDay[]>()
  for (const day of body.data?.poolDayDatas ?? []) {
    const id = day.pool.id.toLowerCase()
    const days = daysByPool.get(id) ?? []
    days.push({ key: String(day.date), tvl: num(day.tvlUSD), volume: num(day.volumeUSD), fee: num(day.feesUSD) })
    daysByPool.set(id, days)
  }
  return (body.data?.pools ?? []).map((pool: any) => ({
    id: pool.id,
    tvl: num(pool.totalValueLockedUSD),
    apr: 0,
    token0: pool.token0,
    token1: pool.token1,
    days: daysByPool.get(pool.id.toLowerCase()) ?? [],
    hemi: true,
  }))
}

function sumDays(days: RawDay[], period: DashboardPeriod, field: 'tvl' | 'volume' | 'fee') {
  const count = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : days.length
  return days.slice(0, count).reduce((total, day) => total + day[field], 0)
}

function normalizePair(pair: RawPair, period: DashboardPeriod): DashboardPairMetric {
  const feeSplit = num(pair.feeSplit)
  const isHemi = pair.hemi === true
  const fee = period === '24h' && !isHemi ? num(pair.feeDay) : sumDays(pair.days, period, 'fee')
  const volume = period === '24h' && !isHemi
    ? num(pair.volumeDay)
    : period === '7d' && pair.volume7Day
      ? num(pair.volume7Day)
      : sumDays(pair.days, period, 'volume')
  return {
    id: pair.id,
    token0: pair.token0,
    token1: pair.token1,
    quoteTokenIndex: pair.quoteTokenIndex,
    tvl: num(pair.tvl) || (pair.days[0]?.tvl ?? 0),
    volume,
    fee,
    revenue: isHemi ? fee * 0.1 : fee * feeSplit,
    apr: num(pair.apr),
    revenueEstimated: isHemi,
  }
}

export function useDashboardPairMetrics(row: RevenueChainRow, period: DashboardPeriod, expanded: boolean) {
  const hasV3 = row.versions.some((version) => version.version === VERSION.V3_OFFICIAL)
  const hasHemi = row.versions.some((version) => version.version === 'hemi')
  const v3Query = useQuery({
    queryKey: ['dashboardPairMetrics', 'v3', row.chainId],
    queryFn: () => fetchV3PairMetrics(row.chainId),
    enabled: expanded && hasV3,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const hemiQuery = useQuery({
    queryKey: ['dashboardPairMetrics', 'hemi', row.chainId],
    queryFn: fetchHemiPairMetrics,
    enabled: expanded && hasHemi,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const pairs = useMemo(
    () => [...(hasV3 ? v3Query.data ?? [] : []), ...(hasHemi ? hemiQuery.data ?? [] : [])]
      .map((pair) => normalizePair(pair, period))
      .filter((pair) => pair.tvl >= 10)
      .sort((a, b) => b.tvl - a.tvl),
    [hasV3, hasHemi, v3Query.data, hemiQuery.data, period],
  )
  return {
    pairs,
    isLoading: (hasV3 && v3Query.isLoading) || (hasHemi && hemiQuery.isLoading),
    isError: (hasV3 && !!v3Query.error) || (hasHemi && !!hemiQuery.error),
  }
}
