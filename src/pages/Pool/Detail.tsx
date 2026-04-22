import { Pair, Token, TokenAmount, JSBI } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Suspense, lazy, useMemo, useState } from 'react'
import { Settings } from 'react-feather'
import { Address, checksumAddress } from 'viem'

import { CurrencyLogo } from 'components/CurrencyLogo'
import { DoubleCurrencyLogo } from 'components/DoubleLogo'
import { isMainnet } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { useDevStats } from 'hooks/useDevStats'
import { useVersion } from 'hooks/useVersion'
import { graphqlFetcher } from 'utils/graphql'
import { formatNumber, formatNumberLambda, formatPrice } from 'utils/prices'
import { getEtherscanLink, getTokenSymbol, shortenAddress } from 'utils'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { PairStats, usePoolStats } from 'components/PositionCard/usePoolStats'
import { fetchOnchainPairTransactions, OnchainTxn } from 'services/onchainTxs'

const PairChartTV = lazy(() =>
  import('components/pool/PairChartTV').then((m) => ({ default: m.PairChartTV })),
)
const YourPositionCard = lazy(() =>
  import('components/pool/YourPositionCard').then((m) => ({ default: m.YourPositionCard })),
)
const PairSettingsModal = lazy(() =>
  import('components/PositionCard/PairSettingsModal').then((m) => ({ default: m.PairSettingsModal })),
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

function secondsToAgo(seconds: number) {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

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


export default function PoolDetail() {
  const { pairAddress, chainId: chainIdParam } = useParams<{ pairAddress: string; chainId: string }>()
  const chainId = Number(chainIdParam)
  const { version } = useVersion({ chainId })

  const { data: pairRes, isLoading } = useQuery<{ pair: PairRaw | null }>({
    queryKey: ['pairDetail', chainId, pairAddress],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairDetail',
        query: GET_PAIR,
        variables: { chainId, id: pairAddress?.toLowerCase() },
      }),
    enabled: !!pairAddress && !!chainId,
    staleTime: 60_000,
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

      {pair && pairRaw && pairAddress && (
        <PoolDetailInner pair={pair} pairRaw={pairRaw} pairAddress={pairAddress} chainId={chainId} />
      )}
    </div>
  )
}

function PoolDetailInner({
  pair,
  pairRaw,
  pairAddress,
  chainId,
}: {
  pair: Pair
  pairRaw: PairRaw
  pairAddress: string
  chainId: number
}) {
  const { chainId: walletChainId, account } = useActiveWeb3React()
  const { version, isBeta } = useVersion({ chainId })

  const { data: userTxs, isLoading: userTxsLoading } = useQuery<OnchainTxn[]>({
    queryKey: ['userPairTxs', chainId, pairAddress, account, pair.token0.decimals, pair.token1.decimals],
    queryFn: () =>
      fetchOnchainPairTransactions({
        chainId,
        pairAddress,
        decimals0: pair.token0.decimals,
        decimals1: pair.token1.decimals,
        user: account!,
        lookbackBlocks: 5000,
        limit: 10,
      }),
    enabled: !!account && chainId === walletChainId,
    retry: false,
    staleTime: 2 * 60_000,
  })

  const pairStats: PairStats | undefined = pairRaw as unknown as PairStats | undefined

  const { tradingFee, volume24h, feeAPR, bgtAPR, merklCampaignApr } = usePoolStats({
    pair,
    pairStats,
    enableFetchDetail: true,
  })

  const devStats = useDevStats({ pair, enabled: !isMainnet })
  const [showSettings, setShowSettings] = useState(false)

  const totalApr = (feeAPR || 0) + (bgtAPR || 0) + (merklCampaignApr || 0)

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const symbol0 = (getTokenSymbol(currency0, chainId) ?? '?')
  const symbol1 = (getTokenSymbol(currency1, chainId) ?? '?')

  const chainMismatch = walletChainId && walletChainId !== chainId

  return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-4">
          {/* Left column */}
          <div className="flex flex-col gap-5 order-2 lg:order-1">
            {chainMismatch && (
              <div
                className="px-4 py-3"
                style={{
                  background: '#2F2823',
                  border: '1px solid #493E35',
                  borderRadius: '12px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#D8A072',
                }}
              >
                This pool is on a different chain than your connected wallet. Switch wallet chain to use Swap / Add / Remove.
              </div>
            )}
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
              <a
                href={getEtherscanLink(chainId, pair.liquidityToken.address, 'address')}
                target="_blank"
                rel="noreferrer"
                className="hover:underline inline-flex items-center gap-1"
                style={{ fontFamily: 'Inter', fontSize: '13px', color: '#978A80', marginLeft: 'auto' }}
                title="View on explorer"
              >
                {shortenAddress(pair.liquidityToken.address)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            {/* Dev stats — non-mainnet only */}
            {!isMainnet && (
              <div
                className="flex flex-wrap items-center gap-3"
                style={{ fontFamily: 'Inter', fontSize: '12px', color: '#8A7D66' }}
              >
                <span>Lambda: {formatNumberLambda(devStats.lambda, { maximumFractionDigits: 4 })}</span>
                <span>Kappa: {formatNumberLambda(devStats.kappa, { maximumFractionDigits: 4 })}</span>
                <span>Fee: {formatNumberLambda(devStats.fee, { maximumFractionDigits: 4 })}</span>
                <span>
                  {version === 3 ? 'FeeSplit' : 'ProtocolFee'}:{' '}
                  {formatNumberLambda(version === 3 ? devStats.feeSplit : devStats.protocolFee, { maximumFractionDigits: 4 })}
                </span>
                {account && (
                  <Settings
                    size="14"
                    className="cursor-pointer"
                    style={{ color: '#c4943a' }}
                    onClick={() => setShowSettings(true)}
                  />
                )}
              </div>
            )}

            {showSettings && (
              <Suspense fallback={null}>
                <PairSettingsModal
                  isOpen={showSettings}
                  onDismiss={() => setShowSettings(false)}
                  pair={pair}
                  currentValues={devStats}
                />
              </Suspense>
            )}

            {/* Chart */}
            <Suspense fallback={<div style={{ height: 460, background: '#1E1915', borderRadius: '16px' }} />}>
              <PairChartTV pair={pair} />
            </Suspense>

            {/* Your recent activity — only shown when wallet is connected on this pool's chain */}
            {account && chainId === walletChainId && (
              <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: '#FBFBFD', marginBottom: '12px' }}>
                  Your recent activity
                </div>
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', fontFamily: 'Inter', fontSize: '13px', color: '#CFC7C1' }}>
                    <thead style={{ color: '#978A80' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500 }}>Time</th>
                        <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500 }}>Type</th>
                        <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500 }}>{symbol0}</th>
                        <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500 }}>{symbol1}</th>
                        <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500 }}>Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userTxs ?? []).map((tx) => {
                        const desc =
                          tx.kind === 'Mint'
                            ? { type: 'Add', color: '#83CF84' }
                            : tx.kind === 'Burn'
                            ? { type: 'Remove', color: '#E57373' }
                            : tx.amount0In > 0
                            ? { type: `Swap ${symbol0} → ${symbol1}`, color: '#D8A072' }
                            : { type: `Swap ${symbol1} → ${symbol0}`, color: '#D8A072' }
                        const amt0 = tx.amount0In + tx.amount0Out
                        const amt1 = tx.amount1In + tx.amount1Out
                        return (
                          <tr key={tx.id} style={{ borderTop: '1px solid #2F2823' }}>
                            <td style={{ padding: '10px 8px' }}>{secondsToAgo(tx.secondsAgo)}</td>
                            <td style={{ padding: '10px 8px', color: desc.color, fontWeight: 500 }}>{desc.type}</td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatNumber(amt0, { maximumFractionDigits: 4 })}</td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatNumber(amt1, { maximumFractionDigits: 4 })}</td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                              <a
                                href={getEtherscanLink(chainId, tx.transactionHash, 'transaction')}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                                style={{ color: '#978A80' }}
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        )
                      })}
                      {userTxsLoading && (
                        <tr>
                          <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#978A80' }}>
                            Loading your activity…
                          </td>
                        </tr>
                      )}
                      {!userTxsLoading && userTxs && userTxs.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#978A80' }}>
                            No recent activity from your wallet on this pool.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4 order-1 lg:order-2">
            {/* Total APR (top) */}
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

            {/* Your position (bottom) */}
            <Suspense fallback={<div style={{ height: 120, background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px' }} />}>
              <YourPositionCard pair={pair} pairStats={pairStats} />
            </Suspense>
          </div>
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
