import { Pair, Token, TokenAmount, JSBI } from '@brownfi/sdk'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
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
    <div className="w-full" style={{ maxWidth: '1280px', padding: '0 8px' }}>
      <Link to="/pool" style={{ color: '#978A80', fontFamily: 'Inter', fontSize: '14px', textDecoration: 'none' }}>
        ← Back to pools
      </Link>

      {isLoading && <PoolDetailSkeleton />}

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
  const navigate = useNavigate()

  // Detect wallet chain CHANGE (not initial mismatch). If user actively
  // switches to a chain that doesn't match this pool, send them to /pool
  // so they can browse pools on the new chain.
  const prevWalletChainRef = useRef(walletChainId)
  useEffect(() => {
    const prev = prevWalletChainRef.current
    prevWalletChainRef.current = walletChainId
    if (prev !== undefined && walletChainId !== undefined && prev !== walletChainId && walletChainId !== chainId) {
      navigate('/pool', { replace: true })
    }
  }, [walletChainId, chainId, navigate])

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

  // 24h fee / TVL (simple ratio, no annualization)
  const feeOverTvl =
    Number(pairRaw.feeDay) > 0 && Number(pairRaw.tvl) > 0
      ? (Number(pairRaw.feeDay) / Number(pairRaw.tvl)) * 100
      : 0
  const incentiveApr = (bgtAPR || 0) + (merklCampaignApr || 0)
  const incentiveIcon = bgtAPR
    ? 'https://furthermore.app/icons/bgt.svg'
    : null

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const symbol0 = (getTokenSymbol(currency0, chainId) ?? '?')
  const symbol1 = (getTokenSymbol(currency1, chainId) ?? '?')

  const chainMismatch = walletChainId && walletChainId !== chainId

  // Spot price from reserves + USD values from pair stats
  const reserve0Num = Number(pair.reserve0.toSignificant(8)) || 0
  const reserve1Num = Number(pair.reserve1.toSignificant(8)) || 0
  const price0 = Number(pairRaw.token0?.price) || 0
  const price1 = Number(pairRaw.token1?.price) || 0
  const rate0To1 = reserve0Num > 0 ? reserve1Num / reserve0Num : 0
  const rate1To0 = reserve1Num > 0 ? reserve0Num / reserve1Num : 0
  const value0 = reserve0Num * price0
  const value1 = reserve1Num * price1
  const totalValue = value0 + value1
  const pct0 = totalValue > 0 ? (value0 / totalValue) * 100 : 50
  const pct1 = 100 - pct0
  const [flipRate, setFlipRate] = useState(false)

  return (
        <>
        {/* Mobile-only section: pair title + dev stats + rate, always on top */}
        <div className="lg:hidden flex flex-col gap-3 mt-4 mb-2">
          <div className="flex items-center gap-3 flex-wrap">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={36} />
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '22px', color: '#FBFBFD' }}>
              {symbol0} / {symbol1}
            </span>
            <span
              style={{
                background: '#2F2823',
                border: '1px solid #493E35',
                borderRadius: '999px',
                padding: '3px 8px',
                fontFamily: 'Inter',
                fontSize: '11px',
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
                padding: '3px 8px',
                fontFamily: 'Inter',
                fontSize: '11px',
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
              style={{ fontFamily: 'Inter', fontSize: '12px', color: '#978A80', marginLeft: 'auto' }}
            >
              {shortenAddress(pair.liquidityToken.address)}
            </a>
          </div>

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

          {(rate0To1 > 0 || rate1To0 > 0) && (
            <button
              onClick={() => setFlipRate((v) => !v)}
              className="inline-flex items-center gap-2 self-start cursor-pointer"
              style={{
                background: '#2F2823',
                border: '1px solid #493E35',
                borderRadius: '10px',
                padding: '8px 12px',
                fontFamily: 'Inter',
                fontSize: '13px',
                color: '#FBFBFD',
              }}
            >
              {flipRate ? (
                <>
                  <span>1 {symbol1} ={' '}</span>
                  <span style={{ color: '#D8A072', fontWeight: 600 }}>
                    {formatNumber(rate1To0, { maximumFractionDigits: 6 })} {symbol0}
                  </span>
                  {price1 > 0 && <span style={{ color: '#978A80' }}>({formatPrice(price1)})</span>}
                </>
              ) : (
                <>
                  <span>1 {symbol0} ={' '}</span>
                  <span style={{ color: '#D8A072', fontWeight: 600 }}>
                    {formatNumber(rate0To1, { maximumFractionDigits: 6 })} {symbol1}
                  </span>
                  {price0 > 0 && <span style={{ color: '#978A80' }}>({formatPrice(price0)})</span>}
                </>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
          )}
        </div>

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
            {/* Header — shown on desktop only; mobile header is above the grid */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
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

            {/* Dev stats — non-mainnet only (above the rate) — desktop only */}
            {!isMainnet && (
              <div
                className="hidden lg:flex flex-wrap items-center gap-3"
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

            {/* Current price + flip — desktop only */}
            {(rate0To1 > 0 || rate1To0 > 0) && (
              <button
                onClick={() => setFlipRate((v) => !v)}
                className="hidden lg:inline-flex items-center gap-2 self-start cursor-pointer"
                style={{
                  background: '#2F2823',
                  border: '1px solid #493E35',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#FBFBFD',
                }}
                title="Flip"
              >
                {flipRate ? (
                  <>
                    <span>1 {symbol1} ={' '}</span>
                    <span style={{ color: '#D8A072', fontWeight: 600 }}>
                      {formatNumber(rate1To0, { maximumFractionDigits: 6 })} {symbol0}
                    </span>
                    {price1 > 0 && <span style={{ color: '#978A80' }}>({formatPrice(price1)})</span>}
                  </>
                ) : (
                  <>
                    <span>1 {symbol0} ={' '}</span>
                    <span style={{ color: '#D8A072', fontWeight: 600 }}>
                      {formatNumber(rate0To1, { maximumFractionDigits: 6 })} {symbol1}
                    </span>
                    {price0 > 0 && <span style={{ color: '#978A80' }}>({formatPrice(price0)})</span>}
                  </>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </button>
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

            {/* Your position — mobile only, above activity */}
            <div className="lg:hidden">
              <Suspense fallback={<div style={{ height: 120, background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px' }} />}>
                <YourPositionCard pair={pair} pairStats={pairStats} />
              </Suspense>
            </div>

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
            {/* APR — beta/non-mainnet only */}
            {!isMainnet && (
              <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '23px' }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#978A80' }}>APR</div>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: '#83CF84', marginTop: '4px' }}>
                  {feeAPR ? `${formatNumber(feeAPR, { maximumFractionDigits: 2 })}%` : '—'}
                </div>
              </div>
            )}

            {/* 24h Fees / TVL (always, white) */}
            <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '23px' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#978A80' }}>24h Fees / TVL</div>
              <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: '#FBFBFD', marginTop: '4px' }}>
                {feeOverTvl ? `${formatNumber(feeOverTvl, { maximumFractionDigits: 4 })}%` : '—'}
              </div>
            </div>

            {/* Incentive APR (only if > 0) */}
            {incentiveApr > 0 && (
              <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '23px' }}>
                <div className="flex items-center gap-2" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#978A80' }}>
                  Incentive APR
                  {incentiveIcon && (
                    <img src={incentiveIcon} alt="BGT" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                  )}
                </div>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: '#83CF84', marginTop: '4px' }}>
                  +{formatNumber(incentiveApr, { maximumFractionDigits: 2 })}%
                </div>
              </div>
            )}

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
                {totalValue > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        height: '6px',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        background: '#2F2823',
                      }}
                    >
                      <div style={{ width: `${pct0}%`, background: '#D8A072' }} />
                      <div style={{ width: `${pct1}%`, background: '#6FB3E6' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: '11px', color: '#978A80', marginTop: '4px' }}>
                      <span>{pct0.toFixed(1)}%</span>
                      <span>{pct1.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </StatRow>

              <StatRow label="TVL" value={formatPrice(pairRaw?.tvl ?? 0)} />
              <StatRow label="24H volume" value={formatPrice(volume24h ?? 0)} />
              <StatRow label="24H fees" value={formatPrice((pairRaw?.feeDay ?? 0) as number)} />
            </div>

            {/* Your position (bottom) — desktop only; mobile renders it below the chart */}
            <div className="hidden lg:block">
              <Suspense fallback={<div style={{ height: 120, background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px' }} />}>
                <YourPositionCard pair={pair} pairStats={pairStats} />
              </Suspense>
            </div>
          </div>
    </div>
    </>
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

function SkeletonBar({ w, h, rounded = 'rounded' }: { w: number | string; h: number; rounded?: string }) {
  return (
    <div
      className={`animate-pulse ${rounded}`}
      style={{
        background: '#493E35',
        height: h,
        width: typeof w === 'number' ? `${w}px` : w,
      }}
    />
  )
}

function PoolDetailSkeleton() {
  const Card = ({ children }: { children?: React.ReactNode }) => (
    <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '20px' }}>
      {children}
    </div>
  )

  return (
    <>
      {/* Mobile-only top block: header + dev stats + rate */}
      <div className="lg:hidden flex flex-col gap-3 mt-4 mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="animate-pulse rounded-full" style={{ background: '#493E35', width: 36, height: 36 }} />
          <SkeletonBar w={140} h={22} />
          <SkeletonBar w={36} h={18} rounded="rounded-full" />
          <SkeletonBar w={44} h={18} rounded="rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBar w={80} h={14} />
          <SkeletonBar w={80} h={14} />
          <SkeletonBar w={80} h={14} />
          <SkeletonBar w={110} h={14} />
        </div>
        <SkeletonBar w={220} h={36} rounded="rounded-[10px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-4">
        {/* Left column */}
        <div className="flex flex-col gap-5 order-2 lg:order-1">
          {/* Desktop-only header */}
          <div className="hidden lg:flex items-center gap-3 flex-wrap">
            <div className="animate-pulse rounded-full" style={{ background: '#493E35', width: 44, height: 44 }} />
            <SkeletonBar w={180} h={32} />
            <SkeletonBar w={42} h={24} rounded="rounded-full" />
            <SkeletonBar w={54} h={24} rounded="rounded-full" />
          </div>

          {/* Desktop-only dev stats + rate */}
          <div className="hidden lg:flex flex-wrap items-center gap-3">
            <SkeletonBar w={90} h={14} />
            <SkeletonBar w={90} h={14} />
            <SkeletonBar w={90} h={14} />
            <SkeletonBar w={120} h={14} />
          </div>
          <div className="hidden lg:block"><SkeletonBar w={240} h={36} rounded="rounded-[10px]" /></div>

          {/* Chart card — matches real structure (range selector + chart + legend) */}
          <div className="p-[12px] sm:p-[16px]" style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px' }}>
            <div className="flex items-center justify-end mb-3">
              <SkeletonBar w={180} h={30} rounded="rounded-[10px]" />
            </div>
            <div className="h-[260px] sm:h-[320px] lg:h-[400px] animate-pulse rounded" style={{ background: '#2F2823' }} />
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
              <SkeletonBar w={80} h={14} />
              <SkeletonBar w={100} h={14} />
              <SkeletonBar w={90} h={14} />
              <SkeletonBar w={100} h={14} />
              <SkeletonBar w={90} h={14} />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4 order-1 lg:order-2">
          <Card>
            <div className="mb-2"><SkeletonBar w={80} h={14} /></div>
            <SkeletonBar w={140} h={36} />
          </Card>
          <Card>
            <div className="mb-4"><SkeletonBar w={60} h={18} /></div>
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between"><SkeletonBar w="45%" h={16} /><SkeletonBar w="45%" h={16} /></div>
              <SkeletonBar w="100%" h={6} rounded="rounded-full" />
              <div className="flex justify-between"><SkeletonBar w={60} h={14} /><SkeletonBar w={60} h={14} /></div>
            </div>
            <div className="flex flex-col gap-3">
              <div><SkeletonBar w={60} h={14} /><div className="mt-1"><SkeletonBar w={100} h={22} /></div></div>
              <div><SkeletonBar w={80} h={14} /><div className="mt-1"><SkeletonBar w={100} h={22} /></div></div>
              <div><SkeletonBar w={70} h={14} /><div className="mt-1"><SkeletonBar w={100} h={22} /></div></div>
            </div>
          </Card>
          {/* Your position (desktop sidebar) */}
          <div className="hidden lg:block">
            <Card>
              <div className="mb-4"><SkeletonBar w={100} h={18} /></div>
              <div className="flex flex-col gap-3">
                <SkeletonBar w="100%" h={16} />
                <SkeletonBar w="100%" h={16} />
                <SkeletonBar w="100%" h={16} />
                <SkeletonBar w="100%" h={36} rounded="rounded-[10px]" />
              </div>
            </Card>
          </div>
        </div>

        {/* Your position (mobile — matches loaded state position below the chart) */}
        <div className="lg:hidden order-3">
          <Card>
            <div className="mb-4"><SkeletonBar w={100} h={18} /></div>
            <div className="flex flex-col gap-3">
              <SkeletonBar w="100%" h={16} />
              <SkeletonBar w="100%" h={16} />
              <SkeletonBar w="100%" h={16} />
              <SkeletonBar w="100%" h={36} rounded="rounded-[10px]" />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
