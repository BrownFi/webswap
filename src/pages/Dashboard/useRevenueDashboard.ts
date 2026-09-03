import { useQueries } from '@tanstack/react-query'
import { availableChains } from 'connectors'
import { useMemo } from 'react'
import { VERSION, V3_OFFICIAL_USE_INDEXER } from 'lib/sdk/constants/addresses'
import { graphqlFetcher } from 'utils/graphql'

const CHAIN_REVENUE_QUERY = `
  query ChainRevenue {
    factories {
      tvl
      totalVolume
      totalFee
      totalRevenue
    }
    factoryDayDatas(first: 30, orderBy: dayStartUnix, orderDirection: desc) {
      dayStartUnix
      dailyVolume
      dailyFees
      dailyRevenue
    }
    pairs(first: 1000) {
      volumeDay
      feeDay
      feeSplit
    }
  }
`

const HEMI_SUBGRAPH_URL = import.meta.env.VITE_GRAPH_API_KEY
  ? `https://gateway.thegraph.com/api/${import.meta.env.VITE_GRAPH_API_KEY}/subgraphs/id/D1UwhrB45geUZTNQ2QwrXwGEhk69iBESApJJzz378ZeS`
  : 'https://api.studio.thegraph.com/query/50593/hemi-analytics/version/latest'

const HEMI_REVENUE_QUERY = `
  query HemiRevenue {
    factories {
      totalValueLockedUSD
      totalVolumeUSD
      totalFeesUSD
      totalCommunityFeesUSD
      totalAlgebraFeesUSD
    }
    algebraDayDatas(orderBy: date, orderDirection: desc, first: 1) {
      date
      volumeUSD
      feesUSD
    }
    algebraDayDatas30: algebraDayDatas(orderBy: date, orderDirection: desc, first: 30) {
      date
      volumeUSD
      feesUSD
    }
  }
`

const ZERO_X_RECIPIENTS = ['0xc0d2948c60fa70e8c52ddcf2cda920a2983d363e', '0x39b38686a19836ac10162c490e4558e120cbbe5f']
const KYBER_RECIPIENTS = ['0x8f10b468b06c6fd214b65f87778827f7d113f996']

const ROBINHOOD_CHAIN_ID = 4663

const ZERO_X_VOLUME_QUERY = `
  query ZeroXVolume($timestampGte: BigInt, $recipients: [String!]) {
    transactions(first: 1000, where: { type: "SWAP", to_in: $recipients, timestamp_gte: $timestampGte }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      amount0Out
      amount1Out
      pythPrice0
      pythPrice1
    }
  }
`

const ZERO_X_VOLUME_OLDER_QUERY = `
  query ZeroXVolumeOlder($timestampGte: BigInt, $timestampLt: BigInt, $recipients: [String!]) {
    transactions(first: 1000, where: { type: "SWAP", to_in: $recipients, timestamp_gte: $timestampGte, timestamp_lt: $timestampLt }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      amount0Out
      amount1Out
      pythPrice0
      pythPrice1
    }
  }
`

const V2_SNAPSHOTS: Record<
  number,
  {
    totalValueLocked: string
    totalVolumeAllTime: string
    totalFeeAllTime: string
    totalRevenueAllTime: string
    totalFee24h: string
    totalRevenue24h: string
  }
> = {
  80094: {
    totalValueLocked: '3052.26493502076308719834447217',
    totalVolumeAllTime: '86158931.84493510853172763268475948',
    totalFeeAllTime: '224068.0177701327156647139396319536',
    totalRevenueAllTime: '70782.5573590071149497634827008291',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  42161: {
    totalValueLocked: '40.31622737984759960491568803',
    totalVolumeAllTime: '1913861.79891756186791376523363619',
    totalFeeAllTime: '774.3731216781383970406485177125009',
    totalRevenueAllTime: '84.50257959657555662300239865565038',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  8453: {
    totalValueLocked: '688.09454067968961570949931993',
    totalVolumeAllTime: '30773664.15011198214916653716104459',
    totalFeeAllTime: '18220.06463531018496715621168822788',
    totalRevenueAllTime: '1950.282413353956368932453495045939',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  999: {
    totalValueLocked: '1415.5198704865209126702301027',
    totalVolumeAllTime: '44039189.10827223438962816187492933',
    totalFeeAllTime: '63488.23156451719505730862641233882',
    totalRevenueAllTime: '10382.26754555973612655699510912325',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
  59144: {
    totalValueLocked: '2095.90889170179964903621228544',
    totalVolumeAllTime: '80683448.64578541996995210166070242',
    totalFeeAllTime: '110844.9389961166438778608694841931',
    totalRevenueAllTime: '18402.99951951931819449245458398714',
    totalFee24h: '0',
    totalRevenue24h: '0',
  },
}

const ZERO_X_PAGE_SIZE = 1000
const ZERO_X_MAX_PAGES = 100

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
  totalValueLocked: number
  totalVolumeAllTime: number
  totalFeeAllTime: number
  totalRevenueAllTime: number
  totalVolume24h: number
  totalFee24h: number
  totalRevenue24h: number
  totalVolume7d: number
  totalFee7d: number
  totalRevenue7d: number
  totalVolume30d: number
  totalFee30d: number
  totalRevenue30d: number
  zeroXVolume24h: number
  kyberVolume24h: number
  isArchived: boolean
}

export type RevenueChainRow = {
  chainId: number
  chainName: string
  totalFeeAllTime: number
  totalRevenueAllTime: number
  totalVolume24h: number
  totalFee24h: number
  totalRevenue24h: number
  totalVolume7d: number
  totalFee7d: number
  totalRevenue7d: number
  totalVolume30d: number
  totalFee30d: number
  totalRevenue30d: number
  zeroXVolume24h: number
  kyberVolume24h: number
  versions: RevenueVersionRow[]
}

export type RevenueDashboardStats = {
  totalVolume24h: number
  totalFeeAllTime: number
  totalRevenueAllTime: number
  totalFee24h: number
  totalRevenue24h: number
  totalVolume7d: number
  totalFee7d: number
  totalRevenue7d: number
  totalVolume30d: number
  totalFee30d: number
  totalRevenue30d: number
}

export type RevenueStatsBreakdown = {
  label: string
  totalValueLocked: number
  totalVolumeAllTime: number
  totalFeeAllTime: number
  totalRevenueAllTime: number
  totalVolume24h: number
  totalFee24h: number
  totalRevenue24h: number
  totalVolume7d: number
  totalFee7d: number
  totalRevenue7d: number
  totalVolume30d: number
  totalFee30d: number
  totalRevenue30d: number
}

export type RevenueDashboardResult = {
  chains: RevenueChainRow[]
  archivedV2: RevenueVersionRow[]
  stats: RevenueDashboardStats
  breakdown: RevenueStatsBreakdown[]
  isLoading: boolean
  isError: boolean
}

export type DashboardPeriod = '24h' | '7d' | '30d'

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function sumDays(days: any[], field: string, count: number): number {
  return days.slice(0, count).reduce((acc, day) => acc + num(day?.[field]), 0)
}

function chainSortWeight(chainId: number) {
  if (chainId === 8453) return -2 // Base
  if (chainId === 42161) return -1 // Arbitrum
  return 0
}

async function fetchChainRevenue(chainId: number, version: typeof VERSION.V2 | typeof VERSION.V3_OFFICIAL) {
  const data = await graphqlFetcher({
    operationName: 'ChainRevenue',
    query: CHAIN_REVENUE_QUERY,
    variables: { chainId, version },
  })
  const factory = (data as any)?.factories?.[0]
  const factoryDays: any[] = (data as any)?.factoryDayDatas ?? []
  const pairs: any[] = (data as any)?.pairs ?? []
  return {
    totalValueLocked: num(factory?.tvl),
    totalVolumeAllTime: num(factory?.totalVolume),
    totalFeeAllTime: num(factory?.totalFee),
    totalRevenueAllTime: num(factory?.totalRevenue),
    totalVolume24h: pairs.reduce((acc, pair) => acc + num(pair?.volumeDay), 0),
    // Pair `feeDay` is the rolling 24h value used by Pool detail/list.
    // `factoryDayDatas.dailyFees` is only the current UTC-day bucket, so it
    // can be materially lower during the day.
    totalFee24h: pairs.reduce((acc, pair) => acc + num(pair?.feeDay), 0),
    // Revenue is a simulation for Robinhood: 7% of rolling 24h pool fees.
    totalRevenue24h:
      chainId === ROBINHOOD_CHAIN_ID
        ? pairs.reduce((acc, pair) => acc + num(pair?.feeDay), 0) * 0.07
        : pairs.reduce((acc, pair) => acc + num(pair?.feeDay) * num(pair?.feeSplit), 0),
    totalVolume7d: sumDays(factoryDays, 'dailyVolume', 7),
    totalFee7d: sumDays(factoryDays, 'dailyFees', 7),
    totalRevenue7d:
      chainId === ROBINHOOD_CHAIN_ID ? sumDays(factoryDays, 'dailyFees', 7) * 0.07 : sumDays(factoryDays, 'dailyRevenue', 7),
    totalVolume30d: sumDays(factoryDays, 'dailyVolume', 30),
    totalFee30d: sumDays(factoryDays, 'dailyFees', 30),
    totalRevenue30d:
      chainId === ROBINHOOD_CHAIN_ID ? sumDays(factoryDays, 'dailyFees', 30) * 0.07 : sumDays(factoryDays, 'dailyRevenue', 30),
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
  const days: any[] = body?.data?.algebraDayDatas30 ?? []
  const totalFees = num(factory?.totalFeesUSD)
  const totalCommunityFees = num(factory?.totalCommunityFeesUSD)
  const dailyFees = num(latestDay?.feesUSD)
  return {
    totalValueLocked: num(factory?.totalValueLockedUSD),
    totalVolumeAllTime: num(factory?.totalVolumeUSD),
    totalFeeAllTime: totalFees,
    totalRevenueAllTime: totalCommunityFees,
    totalVolume24h: num(latestDay?.volumeUSD),
    totalFee24h: dailyFees,
    // Hemi revenue is a simulation: 10% of the latest UTC-day fee bucket.
    totalRevenue24h: dailyFees * 0.1,
    totalVolume7d: sumDays(days, 'volumeUSD', 7),
    totalFee7d: sumDays(days, 'feesUSD', 7),
    totalRevenue7d: sumDays(days, 'feesUSD', 7) * 0.1,
    totalVolume30d: sumDays(days, 'volumeUSD', 30),
    totalFee30d: sumDays(days, 'feesUSD', 30),
    totalRevenue30d: sumDays(days, 'feesUSD', 30) * 0.1,
  }
}

type ZeroXTransaction = {
  timestamp?: number | string
  amount0Out?: number | string
  amount1Out?: number | string
  pythPrice0?: number | string
  pythPrice1?: number | string
}

function zeroXTransactionVolume(transaction: ZeroXTransaction) {
  return (
    num(transaction.amount0Out) * num(transaction.pythPrice0) +
    num(transaction.amount1Out) * num(transaction.pythPrice1)
  )
}

async function fetchAggregatorVolume(chainId: number, recipients: string[]): Promise<number> {
  const timestampGte = Math.floor(Date.now() / 1000) - 24 * 60 * 60
  let timestampLt: number | undefined
  let total = 0

  for (let page = 0; page < ZERO_X_MAX_PAGES; page += 1) {
    const isFirstPage = timestampLt === undefined
    const data = await graphqlFetcher({
      operationName: isFirstPage ? 'ZeroXVolume' : 'ZeroXVolumeOlder',
      query: isFirstPage ? ZERO_X_VOLUME_QUERY : ZERO_X_VOLUME_OLDER_QUERY,
      variables: {
        chainId,
        version: VERSION.V3_OFFICIAL,
        timestampGte: String(timestampGte),
        ...(timestampLt === undefined ? {} : { timestampLt: String(timestampLt) }),
        recipients,
      },
    })
    const transactions = ((data as any)?.transactions ?? []) as ZeroXTransaction[]
    total += transactions.reduce((pageTotal, transaction) => pageTotal + zeroXTransactionVolume(transaction), 0)

    if (transactions.length < ZERO_X_PAGE_SIZE) break
    const oldestTimestamp = num(transactions[transactions.length - 1]?.timestamp)
    if (!oldestTimestamp || oldestTimestamp <= timestampGte) break
    timestampLt = oldestTimestamp
  }

  return total
}

export function useRevenueDashboard(): RevenueDashboardResult {
  const tasks = useMemo<FetchTask[]>(() => {
    const v3Tasks = availableChains
      .filter((chain) => V3_OFFICIAL_USE_INDEXER[chain.id])
      .map((chain) => ({
        kind: 'indexer' as const,
        chainId: chain.id,
        chainName: chain.name,
        version: VERSION.V3_OFFICIAL,
      }))

    return [...v3Tasks, { kind: 'hemi' as const, chainId: 43111, chainName: 'Hemi', version: 'hemi' as const }]
  }, [])

  const queries = useQueries({
    queries: tasks.map((task) => ({
      // Versioned key so newly-added fields (e.g. totalVolume24h) don't keep reading
      // older cached payloads from a previous dashboard shape during the 5-minute stale window.
      queryKey: ['revenueDashboard:v6', task.kind, task.version, task.chainId],
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

  const zeroXChains = [4663, 999]
  const zeroXQueries = useQueries({
    queries: zeroXChains.map((chainId) => ({
      queryKey: ['revenueDashboard:0x:v2', chainId],
      queryFn: () => fetchAggregatorVolume(chainId, ZERO_X_RECIPIENTS),
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchInterval: false as const,
      refetchOnWindowFocus: true,
      retry: 1,
    })),
  })
  const kyberQueries = useQueries({
    queries: zeroXChains.map((chainId) => ({
      queryKey: ['revenueDashboard:kyber:v1', chainId],
      queryFn: () => fetchAggregatorVolume(chainId, KYBER_RECIPIENTS),
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchInterval: false as const,
      refetchOnWindowFocus: true,
      retry: 1,
    })),
  })
  const zeroXVolumeByChain = useMemo(
    () => new Map(zeroXChains.map((chainId, index) => [chainId, zeroXQueries[index]?.data ?? 0])),
    [zeroXQueries],
  )
  const kyberVolumeByChain = useMemo(
    () => new Map(zeroXChains.map((chainId, index) => [chainId, kyberQueries[index]?.data ?? 0])),
    [kyberQueries],
  )

  const liveVersionRows = useMemo<RevenueVersionRow[]>(() => {
    return tasks.map((task, index) => {
      const query = queries[index]
      const data = query.data as
        | {
            totalValueLocked: number
            totalVolumeAllTime: number
            totalFeeAllTime: number
            totalRevenueAllTime: number
            totalVolume24h: number
            totalFee24h: number
            totalRevenue24h: number
            totalVolume7d: number
            totalFee7d: number
            totalRevenue7d: number
            totalVolume30d: number
            totalFee30d: number
            totalRevenue30d: number
          }
        | undefined
      return {
        chainId: task.chainId,
        chainName: task.chainName,
        version: task.version,
        totalValueLocked: data?.totalValueLocked ?? 0,
        totalVolumeAllTime: data?.totalVolumeAllTime ?? 0,
        totalFeeAllTime: data?.totalFeeAllTime ?? 0,
        totalRevenueAllTime: data?.totalRevenueAllTime ?? 0,
        totalVolume24h: data?.totalVolume24h ?? 0,
        totalFee24h: data?.totalFee24h ?? 0,
        totalRevenue24h: data?.totalRevenue24h ?? 0,
        totalVolume7d: data?.totalVolume7d ?? 0,
        totalFee7d: data?.totalFee7d ?? 0,
        totalRevenue7d: data?.totalRevenue7d ?? 0,
        totalVolume30d: data?.totalVolume30d ?? 0,
        totalFee30d: data?.totalFee30d ?? 0,
        totalRevenue30d: data?.totalRevenue30d ?? 0,
        zeroXVolume24h:
          task.version === VERSION.V3_OFFICIAL
            ? Math.min(zeroXVolumeByChain.get(task.chainId) ?? 0, (data?.totalVolume24h ?? 0) * 0.999)
            : 0,
        kyberVolume24h: task.version === VERSION.V3_OFFICIAL ? (kyberVolumeByChain.get(task.chainId) ?? 0) : 0,
        isArchived: task.version === VERSION.V2,
      }
    })
  }, [queries, tasks, zeroXVolumeByChain, kyberVolumeByChain])

  const archivedV2 = useMemo<RevenueVersionRow[]>(() => {
    return availableChains
      .filter((chain) => V2_SNAPSHOTS[chain.id])
      .map((chain) => {
        const snapshot = V2_SNAPSHOTS[chain.id]
        return {
          chainId: chain.id,
          chainName: chain.name,
          version: VERSION.V2,
          totalValueLocked: num(snapshot.totalValueLocked),
          totalVolumeAllTime: num(snapshot.totalVolumeAllTime),
          totalFeeAllTime: num(snapshot.totalFeeAllTime),
          totalRevenueAllTime: num(snapshot.totalRevenueAllTime),
          totalVolume24h: 0,
          totalFee24h: 0,
          totalRevenue24h: 0,
          totalVolume7d: 0,
          totalFee7d: 0,
          totalRevenue7d: 0,
          totalVolume30d: 0,
          totalFee30d: 0,
          totalRevenue30d: 0,
          zeroXVolume24h: 0,
          kyberVolume24h: 0,
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
        existing.totalVolume24h += row.totalVolume24h
        existing.totalFee24h += row.totalFee24h
        existing.totalRevenue24h += row.totalRevenue24h
        existing.totalVolume7d += row.totalVolume7d
        existing.totalFee7d += row.totalFee7d
        existing.totalRevenue7d += row.totalRevenue7d
        existing.totalVolume30d += row.totalVolume30d
        existing.totalFee30d += row.totalFee30d
        existing.totalRevenue30d += row.totalRevenue30d
        existing.zeroXVolume24h += row.zeroXVolume24h
        existing.kyberVolume24h += row.kyberVolume24h
        existing.versions.push(row)
      } else {
        grouped.set(row.chainId, {
          chainId: row.chainId,
          chainName: row.chainName,
          totalFeeAllTime: row.totalFeeAllTime,
          totalRevenueAllTime: row.totalRevenueAllTime,
          totalVolume24h: row.totalVolume24h,
          totalFee24h: row.totalFee24h,
          totalRevenue24h: row.totalRevenue24h,
          totalVolume7d: row.totalVolume7d,
          totalFee7d: row.totalFee7d,
          totalRevenue7d: row.totalRevenue7d,
          totalVolume30d: row.totalVolume30d,
          totalFee30d: row.totalFee30d,
          totalRevenue30d: row.totalRevenue30d,
          zeroXVolume24h: row.zeroXVolume24h,
          kyberVolume24h: row.kyberVolume24h,
          versions: [row],
        })
      }
    }
    return [...grouped.values()].sort((a, b) => {
      const weightDiff = chainSortWeight(a.chainId) - chainSortWeight(b.chainId)
      if (weightDiff !== 0) return -weightDiff
      return b.totalRevenueAllTime - a.totalRevenueAllTime
    })
  }, [versionRows])

  const stats = useMemo<RevenueDashboardStats>(() => {
    return chains.reduce(
      (acc, row) => ({
        totalFeeAllTime: acc.totalFeeAllTime + row.totalFeeAllTime,
        totalRevenueAllTime: acc.totalRevenueAllTime + row.totalRevenueAllTime,
        totalVolume24h: acc.totalVolume24h + row.totalVolume24h,
        totalFee24h: acc.totalFee24h + row.totalFee24h,
        totalRevenue24h: acc.totalRevenue24h + row.totalRevenue24h,
        totalVolume7d: acc.totalVolume7d + row.totalVolume7d,
        totalFee7d: acc.totalFee7d + row.totalFee7d,
        totalRevenue7d: acc.totalRevenue7d + row.totalRevenue7d,
        totalVolume30d: acc.totalVolume30d + row.totalVolume30d,
        totalFee30d: acc.totalFee30d + row.totalFee30d,
        totalRevenue30d: acc.totalRevenue30d + row.totalRevenue30d,
      }),
      { totalVolume24h: 0, totalFeeAllTime: 0, totalRevenueAllTime: 0, totalFee24h: 0, totalRevenue24h: 0, totalVolume7d: 0, totalFee7d: 0, totalRevenue7d: 0, totalVolume30d: 0, totalFee30d: 0, totalRevenue30d: 0 },
    )
  }, [chains])

  const breakdown = useMemo<RevenueStatsBreakdown[]>(() => {
    const groups: Array<{ label: string; rows: RevenueVersionRow[] }> = [
      { label: 'V3', rows: liveVersionRows.filter((row) => row.version === VERSION.V3_OFFICIAL) },
      { label: 'V2', rows: archivedV2 },
      { label: 'Hemi', rows: liveVersionRows.filter((row) => row.version === 'hemi') },
    ]
    return groups.map((group) =>
      group.rows.reduce<RevenueStatsBreakdown>(
        (acc, row) => ({
          label: group.label,
          totalValueLocked: acc.totalValueLocked + row.totalValueLocked,
          totalVolumeAllTime: acc.totalVolumeAllTime + row.totalVolumeAllTime,
          totalFeeAllTime: acc.totalFeeAllTime + row.totalFeeAllTime,
          totalRevenueAllTime: acc.totalRevenueAllTime + row.totalRevenueAllTime,
          totalVolume24h: acc.totalVolume24h + row.totalVolume24h,
          totalFee24h: acc.totalFee24h + row.totalFee24h,
          totalRevenue24h: acc.totalRevenue24h + row.totalRevenue24h,
          totalVolume7d: acc.totalVolume7d + row.totalVolume7d,
          totalFee7d: acc.totalFee7d + row.totalFee7d,
          totalRevenue7d: acc.totalRevenue7d + row.totalRevenue7d,
          totalVolume30d: acc.totalVolume30d + row.totalVolume30d,
          totalFee30d: acc.totalFee30d + row.totalFee30d,
          totalRevenue30d: acc.totalRevenue30d + row.totalRevenue30d,
        }),
        {
          label: group.label,
          totalValueLocked: 0,
          totalVolumeAllTime: 0,
          totalFeeAllTime: 0,
          totalRevenueAllTime: 0,
          totalVolume24h: 0,
          totalFee24h: 0,
          totalRevenue24h: 0,
          totalVolume7d: 0,
          totalFee7d: 0,
          totalRevenue7d: 0,
          totalVolume30d: 0,
          totalFee30d: 0,
          totalRevenue30d: 0,
        },
      ),
    )
  }, [liveVersionRows, archivedV2])

  return {
    chains,
    archivedV2,
    stats,
    breakdown,
    isLoading:
      queries.some((query) => query.isLoading) ||
      zeroXQueries.some((query) => query.isLoading) ||
      kyberQueries.some((query) => query.isLoading),
    isError: queries.every((query) => query.isError),
  }
}
