import { useQueries } from '@tanstack/react-query'
import { availableChains } from 'connectors'
import { useMemo } from 'react'
import { VERSION, V3_OFFICIAL_USE_INDEXER } from 'lib/sdk/constants/addresses'
import { graphqlFetcher } from 'utils/graphql'

const CHAIN_REVENUE_QUERY = `
  query ChainRevenue {
    factories {
      totalFee
      totalRevenue
    }
    factoryDayDatas(first: 1, orderBy: dayStartUnix, orderDirection: desc) {
      dayStartUnix
      dailyFees
      dailyRevenue
    }
  }
`

const HEMI_SUBGRAPH_URL = import.meta.env.VITE_GRAPH_API_KEY
  ? `https://gateway.thegraph.com/api/${import.meta.env.VITE_GRAPH_API_KEY}/subgraphs/id/D1UwhrB45geUZTNQ2QwrXwGEhk69iBESApJJzz378ZeS`
  : 'https://api.studio.thegraph.com/query/50593/hemi-analytics/version/latest'

const HEMI_REVENUE_QUERY = `
  query HemiRevenue {
    factories {
      totalFeesUSD
      totalCommunityFeesUSD
      totalAlgebraFeesUSD
    }
    algebraDayDatas(orderBy: date, orderDirection: desc, first: 1) {
      date
      feesUSD
    }
  }
`

const V2_SNAPSHOTS: Record<number, { totalFeeAllTime: string; totalRevenueAllTime: string; totalFee24h: string; totalRevenue24h: string }> = {
  80094: {
    totalFeeAllTime: '224068.0177701327156647139396319536',
    totalRevenueAllTime: '70782.5573590071149497634827008291',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  42161: {
    totalFeeAllTime: '774.3731216781383970406485177125009',
    totalRevenueAllTime: '84.50257959657555662300239865565038',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  8453: {
    totalFeeAllTime: '18220.06463531018496715621168822788',
    totalRevenueAllTime: '1950.282413353956368932453495045939',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  999: {
    totalFeeAllTime: '63488.23156451719505730862641233882',
    totalRevenueAllTime: '10382.26754555973612655699510912325',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  59144: {
    totalFeeAllTime: '110844.9389961166438778608694841931',
    totalRevenueAllTime: '18402.99951951931819449245458398714',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
}

type VersionValue = typeof VERSION.V2 | typeof VERSION.V3_OFFICIAL | 'hemi'

type FetchTask = {
  kind: 'indexer' | 'hemi'
  chainId: number
  chainName: string
  version: VersionValue
}

export type RevenueVersionRow = {
  chainId: number
  chainName: string
  version: VersionValue
  totalFeeAllTime: number
  totalRevenueAllTime: number
  totalFee24h: number
  totalRevenue24h: number
  isArchived: boolean
}

export type RevenueChainRow = {
  chainId: number
  chainName: string
  totalFeeAllTime: number
  totalRevenueAllTime: number
  totalFee24h: number
  totalRevenue24h: number
  versions: RevenueVersionRow[]
}

export type RevenueDashboardStats = {
  totalFeeAllTime: number
  totalRevenueAllTime: number
  totalFee24h: number
  totalRevenue24h: number
}

export type RevenueDashboardResult = {
  chains: RevenueChainRow[]
  archivedV2: RevenueVersionRow[]
  stats: RevenueDashboardStats
  isLoading: boolean
  isError: boolean
}

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

async function fetchChainRevenue(chainId: number, version: typeof VERSION.V2 | typeof VERSION.V3_OFFICIAL) {
  const data = await graphqlFetcher({
    operationName: 'ChainRevenue',
    query: CHAIN_REVENUE_QUERY,
    variables: { chainId, version },
  })
  const factory = (data as any)?.factories?.[0]
  const latestDay = (data as any)?.factoryDayDatas?.[0]
  return {
    totalFeeAllTime: num(factory?.totalFee),
    totalRevenueAllTime: num(factory?.totalRevenue),
    totalFee24h: num(latestDay?.dailyFees),
    totalRevenue24h: num(latestDay?.dailyRevenue),
  }
}

async function fetchHemiRevenue() {
  const response = await fetch(HEMI_SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName: 'HemiRevenue', query: HEMI_REVENUE_QUERY, variables: {} }),
  })
  if (!response.ok) throw new Error(`Hemi revenue HTTP ${response.status}`)
  const body = (await response.json()) as any
  const factory = body?.data?.factories?.[0]
  const latestDay = body?.data?.algebraDayDatas?.[0]
  const totalFees = num(factory?.totalFeesUSD)
  const totalCommunityFees = num(factory?.totalCommunityFeesUSD)
  const revenueRatio = totalFees > 0 ? totalCommunityFees / totalFees : 0
  const dailyFees = num(latestDay?.feesUSD)
  return {
    totalFeeAllTime: totalFees,
    totalRevenueAllTime: totalCommunityFees,
    totalFee24h: dailyFees,
    totalRevenue24h: dailyFees * revenueRatio,
  }
}

export function useRevenueDashboard(): RevenueDashboardResult {
  const tasks = useMemo<FetchTask[]>(() => {
    const v3Tasks = availableChains
      .filter((chain) => V3_OFFICIAL_USE_INDEXER[chain.id])
      .map((chain) => ({
        kind: 'indexer' as const,
        chainId: chain.id,
        chainName: chain.name,
        version: VERSION.V3_OFFICIAL as const,
      }))

    return [
      ...v3Tasks,
      { kind: 'hemi' as const, chainId: 43111, chainName: 'Hemi', version: 'hemi' as const },
    ]
  }, [])

  const queries = useQueries({
    queries: tasks.map((task) => ({
      queryKey: ['revenueDashboard', task.kind, task.version, task.chainId],
      queryFn: () =>
        task.kind === 'hemi'
          ? fetchHemiRevenue()
          : fetchChainRevenue(task.chainId, task.version as typeof VERSION.V2 | typeof VERSION.V3_OFFICIAL),
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchInterval: false as const,
      refetchOnWindowFocus: true,
      retry: 1,
    })),
  })

  const liveVersionRows = useMemo<RevenueVersionRow[]>(() => {
    return tasks.map((task, index) => {
      const query = queries[index]
      const data = query.data as
        | {
            totalFeeAllTime: number
            totalRevenueAllTime: number
            totalFee24h: number
            totalRevenue24h: number
          }
        | undefined
      return {
        chainId: task.chainId,
        chainName: task.chainName,
        version: task.version,
        totalFeeAllTime: data?.totalFeeAllTime ?? 0,
        totalRevenueAllTime: data?.totalRevenueAllTime ?? 0,
        totalFee24h: data?.totalFee24h ?? 0,
        totalRevenue24h: data?.totalRevenue24h ?? 0,
        isArchived: task.version === VERSION.V2,
      }
    })
  }, [queries, tasks])

  const archivedV2 = useMemo<RevenueVersionRow[]>(() => {
    return availableChains
      .filter((chain) => V2_SNAPSHOTS[chain.id])
      .map((chain) => {
        const snapshot = V2_SNAPSHOTS[chain.id]
        return {
          chainId: chain.id,
          chainName: chain.name,
          version: VERSION.V2 as const,
          totalFeeAllTime: num(snapshot.totalFeeAllTime),
          totalRevenueAllTime: num(snapshot.totalRevenueAllTime),
          totalFee24h: 0,
          totalRevenue24h: 0,
          isArchived: true,
        }
      })
  }, [])

  const versionRows = useMemo(() => [...liveVersionRows, ...archivedV2], [liveVersionRows, archivedV2])

  const chains = useMemo<RevenueChainRow[]>(() => {
    const grouped = new Map<number, RevenueChainRow>()
    for (const row of versionRows) {
      const existing = grouped.get(row.chainId)
      if (existing) {
        existing.totalFeeAllTime += row.totalFeeAllTime
        existing.totalRevenueAllTime += row.totalRevenueAllTime
        existing.totalFee24h += row.totalFee24h
        existing.totalRevenue24h += row.totalRevenue24h
        existing.versions.push(row)
      } else {
        grouped.set(row.chainId, {
          chainId: row.chainId,
          chainName: row.chainName,
          totalFeeAllTime: row.totalFeeAllTime,
          totalRevenueAllTime: row.totalRevenueAllTime,
          totalFee24h: row.totalFee24h,
          totalRevenue24h: row.totalRevenue24h,
          versions: [row],
        })
      }
    }
    return [...grouped.values()].sort((a, b) => b.totalRevenueAllTime - a.totalRevenueAllTime)
  }, [versionRows])

  const stats = useMemo<RevenueDashboardStats>(() => {
    return chains.reduce(
      (acc, row) => ({
        totalFeeAllTime: acc.totalFeeAllTime + row.totalFeeAllTime,
        totalRevenueAllTime: acc.totalRevenueAllTime + row.totalRevenueAllTime,
        totalFee24h: acc.totalFee24h + row.totalFee24h,
        totalRevenue24h: acc.totalRevenue24h + row.totalRevenue24h,
      }),
      { totalFeeAllTime: 0, totalRevenueAllTime: 0, totalFee24h: 0, totalRevenue24h: 0 },
    )
  }, [chains])

  return {
    chains,
    archivedV2,
    stats,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.every((query) => query.isError),
  }
}
