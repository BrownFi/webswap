import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { graphqlFetcher } from 'utils/graphql'

// Pool config history from the indexer's `updatedEvents` log — the proper source
// for the Pool Config chart (per Manh; config is NOT meaningfully on the per-swap
// `transaction` entity for this purpose). Each admin retune emits ONE event with
// the new (and prev) value(s), already DECIMAL-DECODED (no Q64/1e8 math). Multi-
// value setters pack several params:
//   KappaOfPairUpdated  → newValue = kB,       newValue2 = kQ
//   SpreadOfPairUpdated → newValue = compress, newValue2 = sSell, newValue3 = sBuy
//   LambdaOfPairUpdated → newValue = lambda
// (mapping cross-checked exact vs the transaction entity's decoded config.)
//
// A pool's ENTIRE config history is tens of events, so one un-paginated query
// replaces the per-swap walk the chart used to do.

export type ConfigSnapshot = {
  t: number
  lambda?: number
  kB?: number
  kQ?: number
  compress?: number
  sSell?: number
  sBuy?: number
}

type RawEvent = {
  type: string
  newValue: string | null
  newValue2: string | null
  newValue3: string | null
  prevValue: string | null
  prevValue2: string | null
  prevValue3: string | null
  updatedAt: string
}

const QUERY = `
  query PoolConfigEvents($pair: String) {
    updatedEvents(first: 1000, where: { pair: $pair }, orderBy: updatedAt, orderDirection: asc) {
      type
      newValue
      newValue2
      newValue3
      prevValue
      prevValue2
      prevValue3
      updatedAt
    }
  }
`

const num = (v: string | null): number | undefined => {
  if (v == null) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function usePoolConfigEvents({
  pairAddress,
  chainId,
  version,
  enabled = true,
}: {
  pairAddress: string
  chainId: number
  version: number
  enabled?: boolean
}) {
  const { data, isLoading, isError } = useQuery<RawEvent[]>({
    queryKey: ['poolConfigEvents', chainId, pairAddress?.toLowerCase(), version],
    queryFn: async () => {
      const res = (await graphqlFetcher({
        operationName: 'PoolConfigEvents',
        query: QUERY,
        variables: { chainId, version, pair: pairAddress.toLowerCase() },
      })) as { updatedEvents?: RawEvent[] } | null
      return res?.updatedEvents ?? []
    },
    enabled: enabled && !!pairAddress && !!chainId,
    staleTime: 60_000,
  })

  // Step-carry the sparse change events into full snapshots: each snapshot carries
  // ALL params at that instant, so a change to one param still renders the others
  // at their held value. Seed from the earliest event's PREV value per group so a
  // param that changes LATER still shows its correct initial value at an earlier
  // point (e.g. lambda at the first kappa change).
  const snapshots = useMemo<ConfigSnapshot[]>(() => {
    const events = data ?? []
    if (!events.length) return []

    const state: ConfigSnapshot = { t: 0 }
    for (const ev of events) {
      if (ev.type === 'LambdaOfPairUpdated' && state.lambda === undefined) state.lambda = num(ev.prevValue)
      if (ev.type === 'KappaOfPairUpdated' && state.kB === undefined) {
        state.kB = num(ev.prevValue)
        state.kQ = num(ev.prevValue2)
      }
      if (ev.type === 'SpreadOfPairUpdated' && state.compress === undefined) {
        state.compress = num(ev.prevValue)
        state.sSell = num(ev.prevValue2)
        state.sBuy = num(ev.prevValue3)
      }
    }

    const out: ConfigSnapshot[] = []
    for (const ev of events) {
      switch (ev.type) {
        case 'LambdaOfPairUpdated':
          state.lambda = num(ev.newValue)
          break
        case 'KappaOfPairUpdated':
          state.kB = num(ev.newValue)
          state.kQ = num(ev.newValue2)
          break
        case 'SpreadOfPairUpdated':
          state.compress = num(ev.newValue)
          state.sSell = num(ev.newValue2)
          state.sBuy = num(ev.newValue3)
          break
        default:
          continue // fee / gamma / pythWeight / … not shown on this chart
      }
      const t = Number(ev.updatedAt)
      if (!Number.isFinite(t)) continue
      // Collapse multiple changes in the same block/second (setData needs strictly
      // ascending times) — the last write wins.
      if (out.length && out[out.length - 1].t === t) out[out.length - 1] = { ...state, t }
      else out.push({ ...state, t })
    }
    return out
  }, [data])

  return { snapshots, isLoading, isError }
}
