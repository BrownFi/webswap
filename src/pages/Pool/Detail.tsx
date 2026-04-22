import { Pair, Token, TokenAmount, JSBI } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Suspense, lazy, useMemo } from 'react'
import { Address, checksumAddress } from 'viem'
import dayjs from 'dayjs'

import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo } from 'components/DoubleLogo'
import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'
import { graphqlFetcher } from 'utils/graphql'
import { formatNumber, formatPrice } from 'utils/prices'
import { getTokenSymbol, shortenAddress } from 'utils'
import { currencyId } from 'utils/currencyId'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { PairStats, usePoolStats } from 'components/PositionCard/usePoolStats'

const PairChartModal = lazy(() =>
  import('components/pool/PairChartModal').then((m) => ({ default: m.PairChartModal })),
)

const GET_PAIR = `
  query PairDetail($id: ID!) {
    pair(id: $id) {
      id
      fee
      protocolFee
      feeDay
      totalSupply
      reserve0
      reserve1
      tvl
      apr
      volumeDay
      volume7Day
      updatedAt
      token0 { id decimals name price priceFeedId symbol totalSupply }
      token1 { id decimals name price priceFeedId symbol totalSupply }
    }
  }
`

const GET_TRANSACTIONS = `
  query PairTransactions($pair: String) {
    transactions(
      first: 50
      where: { pair: $pair }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      reserve0USD
      reserve1USD
      lpMint
      lpBurn
      timestamp
    }
  }
`

type PairRaw = {
  id: string
  fee: number
  protocolFee: number
  feeDay: number
  totalSupply: number
  reserve0: number
  reserve1: number
  tvl: number
  apr: number
  volumeDay: number
  volume7Day: number
  updatedAt: number
  token0: PairStats['token0']
  token1: PairStats['token1']
}

type Txn = {
  id: string
  from: string
  amount0In: number
  amount1In: number
  amount0Out: number
  amount1Out: number
  reserve0USD: number
  reserve1USD: number
  lpMint: number
  lpBurn: number
  timestamp: number
}

function describeTx(tx: Txn, symbol0: string, symbol1: string) {
  if (tx.lpMint > 0) return { type: 'Add', color: '#83CF84' }
  if (tx.lpBurn > 0) return { type: 'Remove', color: '#EE4B2B' }
  if (tx.amount0In > 0) return { type: `Sell ${symbol0}`, color: '#EE4B2B' }
  return { type: `Sell ${symbol1}`, color: '#EE4B2B' }
}

function timeAgo(unix: number) {
  const diff = dayjs().diff(dayjs.unix(unix), 'second')
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function PoolDetail() {
  const { pairAddress } = useParams<{ pairAddress: string }>()
  const { chainId } = useActiveWeb3React()
  const { version, isBeta } = useVersion({ chainId })

  const { data: pairRes, isLoading } = useQuery<{ pair: PairRaw | null }>({
    queryKey: ['pairDetail', chainId, pairAddress],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairDetail',
        query: GET_PAIR,
        variables: { chainId, id: pairAddress?.toLowerCase() },
      }),
    enabled: !!pairAddress,
    staleTime: 60_000,
  })

  const { data: txRes } = useQuery<{ transactions: Txn[] }>({
    queryKey: ['pairTxs', chainId, pairAddress],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairTransactions',
        query: GET_TRANSACTIONS,
        variables: { chainId, pair: pairAddress?.toLowerCase() },
      }),
    enabled: !!pairAddress,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const pairRaw = pairRes?.pair
  const pair = useMemo(() => {
    if (!pairRaw || !chainId) return null
    const t0 = pairRaw.token0
    const t1 = pairRaw.token1
    return new Pair(
      new TokenAmount(
        new Token(chainId, checksumAddress(t0!.id as Address), t0!.decimals, t0?.symbol, t0?.name),
        JSBI.BigInt(Math.round(pairRaw.reserve0 * 10 ** t0!.decimals)),
      ),
      new TokenAmount(
        new Token(chainId, checksumAddress(t1!.id as Address), t1!.decimals, t1?.symbol, t1?.name),
        JSBI.BigInt(Math.round(pairRaw.reserve1 * 10 ** t1!.decimals)),
      ),
      version,
    )
  }, [pairRaw, chainId, version])

  const pairStats: PairStats | undefined = pairRaw as unknown as PairStats | undefined

  const { tradingFee, volume24h, feeAPR, bgtAPR, merklCampaignApr } = usePoolStats({
    pair: pair ?? ({} as Pair),
    pairStats,
    enableFetchDetail: true,
  })

  const totalApr = (feeAPR || 0) + (bgtAPR || 0) + (merklCampaignApr || 0)

  const currency0 = pair ? unwrappedToken(pair.token0) : null
  const currency1 = pair ? unwrappedToken(pair.token1) : null

  const symbol0 = (currency0 ? getTokenSymbol(currency0, chainId) : '?') ?? '?'
  const symbol1 = (currency1 ? getTokenSymbol(currency1, chainId) : '?') ?? '?'

  return (
    <div className="w-full" style={{ maxWidth: '1280px', padding: '0 16px' }}>
      <Link to="/pool" style={{ color: '#978A80', fontFamily: 'Inter', fontSize: '14px', textDecoration: 'none' }}>
        ← Back to pools
      </Link>

      {isLoading && (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#978A80', fontFamily: 'Inter' }}>Loading pool…</div>
      )}

      {!isLoading && !pair && (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#978A80', fontFamily: 'Inter' }}>
          Pool not found.
        </div>
      )}

      {pair && currency0 && currency1 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-4">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={44} />
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '28px', color: '#FBFBFD' }}>
                {symbol0} / {symbol1}
              </span>
              <span
                style={{
                  background: '#2F2823',
                  border: '1px solid #493E35',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#FBFBFD',
                }}
              >
                v{version}
              </span>
              <span
                style={{
                  background: '#2F2823',
                  border: '1px solid #493E35',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#83CF84',
                }}
              >
                {formatNumber(tradingFee, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
              </span>
              {isBeta && (
                <span style={{ background: '#f97316', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#fff' }}>
                  Beta
                </span>
              )}
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#978A80', marginLeft: 'auto' }}>
                {shortenAddress(pair.liquidityToken.address)}
              </span>
            </div>

            {/* Chart */}
            <Suspense fallback={<div style={{ height: 400, background: '#1E1915', borderRadius: '16px' }} />}>
              <PairChartModal
                pair={pair}
                name={<span style={{ color: '#FBFBFD' }}>{symbol0} / {symbol1}</span>}
                enableAdvancedZoom
                inline
              />
            </Suspense>

            {/* Transactions */}
            <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD', marginBottom: '12px' }}>
                Transactions
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', fontFamily: 'Inter', fontSize: '13px', color: '#CFC7C1' }}>
                  <thead style={{ color: '#978A80' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500 }}>Time</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500 }}>USD</th>
                      <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500 }}>{symbol0}</th>
                      <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500 }}>{symbol1}</th>
                      <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500 }}>Wallet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(txRes?.transactions ?? []).map((tx) => {
                      const desc = describeTx(tx, symbol0, symbol1)
                      const usd = tx.amount0In > 0 ? tx.reserve0USD : tx.reserve1USD
                      const amt0 = tx.amount0In + tx.amount0Out
                      const amt1 = tx.amount1In + tx.amount1Out
                      return (
                        <tr key={tx.id} style={{ borderTop: '1px solid #2F2823' }}>
                          <td style={{ padding: '10px 8px' }}>{timeAgo(tx.timestamp)}</td>
                          <td style={{ padding: '10px 8px', color: desc.color, fontWeight: 500 }}>{desc.type}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatPrice(usd)}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatNumber(amt0, { maximumFractionDigits: 4 })}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatNumber(amt1, { maximumFractionDigits: 4 })}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', color: '#978A80' }}>{shortenAddress(tx.from)}</td>
                        </tr>
                      )
                    })}
                    {txRes && txRes.transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#978A80' }}>
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to={`/swap?inputCurrency=${currencyId(currency0)}&outputCurrency=${currencyId(currency1)}`}
                className="inline-flex items-center justify-center no-underline"
                style={{
                  background: '#2F2823',
                  border: '1px solid #493E35',
                  borderRadius: '12px',
                  padding: '12px',
                  fontFamily: 'Inter',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#FBFBFD',
                }}
              >
                Swap
              </Link>
              <Link
                to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                className="inline-flex items-center justify-center no-underline"
                style={{
                  background: '#985C2A',
                  borderRadius: '12px',
                  padding: '12px',
                  fontFamily: 'Inter',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                }}
              >
                + Add liquidity
              </Link>
            </div>

            {/* Total APR */}
            <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#978A80' }}>Total APR</div>
              <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: '#83CF84', marginTop: '4px' }}>
                {totalApr ? `${formatNumber(totalApr, { maximumFractionDigits: 2 })}%` : '—'}
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '16px', color: '#FBFBFD', marginBottom: '16px' }}>
                Stats
              </div>

              <StatRow label="Pool balances">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: '13px', color: '#FBFBFD', marginTop: '4px' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <CurrencyLogo currency={currency0} size="16px" />
                    {formatNumber(Number(pair.reserve0.toSignificant(6)), { maximumFractionDigits: 2 })} {symbol0}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {formatNumber(Number(pair.reserve1.toSignificant(6)), { maximumFractionDigits: 2 })} {symbol1}
                    <CurrencyLogo currency={currency1} size="16px" />
                  </span>
                </div>
              </StatRow>

              <StatRow label="TVL" value={formatPrice(pairRaw?.tvl ?? 0)} />
              <StatRow label="24H volume" value={formatPrice(volume24h ?? 0)} />
              <StatRow label="24H fees" value={formatPrice((pairRaw?.feeDay ?? 0) as number)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '13px', color: '#978A80' }}>{label}</div>
      {value !== undefined && (
        <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '22px', color: '#FBFBFD', marginTop: '2px' }}>
          {value}
        </div>
      )}
      {children}
    </div>
  )
}
