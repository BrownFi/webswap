import { JSBI, Pair, Percent, TokenAmount } from '@brownfi/sdk'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useChainGuard } from 'hooks/useChainGuard'
import { useTotalSupply } from 'data/TotalSupply'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { Loader } from 'components/Loader'
import { isMainnet } from 'connectors'
import { getTokenSymbol } from 'utils'
import { orderedCurrencyIds } from 'utils/pair'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { formatNumber, formatPrice } from 'utils/prices'
import { usePythPrices } from 'hooks/usePythPrices'
import { useRestakedPositions } from 'hooks/useRestakedPositions'
import { PairStats, usePoolStats } from 'components/PositionCard/usePoolStats'
import ConnectWallet from 'components/ConnectWallet'

type Props = {
  pair: Pair
  pairStats?: PairStats
}

export function YourPositionCard({ pair, pairStats }: Props) {
  const { account, chainId } = useActiveWeb3React()

  // Collapsed by default so the stats row above stays above the fold; user
  // expands when they actually want the LP/portfolio breakdown. We only
  // collapse the *details* block — the Total LP summary line and the
  // Add/Remove buttons stay visible so the card still acts as a CTA.
  const [expanded, setExpanded] = useState(false)

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [balanceMap] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    [pair.liquidityToken],
  )
  const userPoolBalance = balanceMap[pair.liquidityToken.address]
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const restakedPositions = useRestakedPositions({ chainId, pair, account })
  const activeRestaked = restakedPositions.filter(
    (p) => p.balance && JSBI.greaterThan(p.balance.raw, JSBI.BigInt(0)),
  )

  const totalLpRaw = JSBI.add(
    userPoolBalance?.raw ?? JSBI.BigInt(0),
    activeRestaked.reduce((acc, p) => JSBI.add(acc, p.balance!.raw), JSBI.BigInt(0)),
  )
  const totalLp = JSBI.greaterThan(totalLpRaw, JSBI.BigInt(0))
    ? new TokenAmount(pair.liquidityToken, totalLpRaw)
    : undefined

  const poolTokenPercentage =
    !!totalLp && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, totalLp.raw)
      ? new Percent(totalLp.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!totalPoolTokens && !!totalLp && JSBI.greaterThanOrEqual(totalPoolTokens.raw, totalLp.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, totalLp, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, totalLp, false),
        ]
      : [undefined, undefined]

  const { pairAccount } = usePoolStats({
    pair,
    pairStats,
    enableFetchDetail: !!account,
  })

  const pythPrices = usePythPrices({
    chainId,
    pair,
    pairStats,
    currencyA: pair.token0,
    currencyB: pair.token1,
    enableFetchDetail: !!account,
  })
  const token0Price = pythPrices.CURRENCY_A || pairStats?.token0?.price || 0
  const token1Price = pythPrices.CURRENCY_B || pairStats?.token1?.price || 0

  const symbol0 = getTokenSymbol(currency0, chainId) ?? '?'
  const symbol1 = getTokenSymbol(currency1, chainId) ?? '?'

  const poolChainId = pair.liquidityToken.chainId
  const chainMismatch = !!account && chainId !== poolChainId
  // Cross-chain action handling — when the user's wallet is on a chain
  // other than the pool's chain, the Add/Remove buttons morph into
  // "Switch to {pool's chain}" buttons that trigger a wallet switch
  // before performing the action.
  const guard = useChainGuard(poolChainId)
  const navigate = useNavigate()

  const hasWalletLp =
    !!userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0))
  const hasStakedLp = activeRestaked.length > 0
  const hasLiquidity = !!totalLp
  // `userPoolBalance === undefined` means the multicall hasn't completed yet.
  // A completed call — even for a true-zero balance — produces a defined TokenAmount,
  // so this is a reliable gate that covers both the pre-register frame and in-flight fetch.
  const balanceUnknown = !!account && !chainMismatch && userPoolBalance === undefined

  // Only render the chevron when there's actually something to expand into —
  // i.e., the user has a position. In the empty/connect/loading states the
  // body is already tiny so a toggle would be useless noise.
  const showToggle = !!account && !chainMismatch && hasLiquidity

  return (
    <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', padding: '20px' }}>
      <button
        type="button"
        onClick={() => showToggle && setExpanded((v) => !v)}
        className={`flex items-center justify-between w-full ${showToggle ? 'cursor-pointer' : 'cursor-default'}`}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          marginBottom: '16px',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: '16px',
          color: '#FBFBFD',
          textAlign: 'left',
        }}
      >
        <span>Your position</span>
        {showToggle && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#978A80', transition: 'transform 150ms', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {!account ? (
        <ConnectWallet />
      ) : chainMismatch ? (
        <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#978A80', lineHeight: '20px' }}>
          Switch your wallet network to view your position in this pool.
        </div>
      ) : balanceUnknown ? (
        <div className="space-y-3">
          <PositionSkeletonRow w={120} />
          <PositionSkeletonRow w={140} />
          <PositionSkeletonRow w={140} />
        </div>
      ) : !hasLiquidity ? (
        <>
          <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#978A80', lineHeight: '20px', marginBottom: '12px' }}>
            You don&apos;t have liquidity in this pool yet.
          </div>
          <Link
            to={`/add/${orderedCurrencyIds(currency0, currency1, chainId).join("/")}`}
            className="no-underline inline-flex items-center justify-center w-full"
            style={{
              background: '#985C2A',
              borderRadius: '8px',
              padding: '10px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 500,
              color: '#FFFFFF',
            }}
          >
            + Add liquidity
          </Link>
        </>
      ) : (
        <div className="space-y-3">
          {/* Total LP — always visible (collapsed-state summary). Add/Remove
              buttons are hidden when collapsed because the rail already shows
              Swap + Add liquidity CTAs at the very top. */}
          <Row label="Total LP">
            {poolTokenPercentage && totalLp ? (
              <span>
                {formatNumber(totalLp.toSignificant(6))}
                <span style={{ color: '#978A80', marginLeft: 6 }}>
                  ({poolTokenPercentage.toFixed(2) === '0.00' ? '0' : poolTokenPercentage.toFixed(2)}%)
                </span>
              </span>
            ) : (
              <Loader stroke="gray" />
            )}
          </Row>

          {expanded && (hasStakedLp || hasWalletLp) && (
            <div className="pl-3" style={{ borderLeft: '1px solid #2F2823' }}>
              <div className="space-y-2">
                {hasWalletLp && (
                  <SubRow label="In wallet" amount={userPoolBalance!} />
                )}
                {activeRestaked.map((p) => (
                  <SubRow
                    key={p.config.vaultAddress}
                    label={`Staked on ${p.config.platform}`}
                    amount={p.balance!}
                    actionLabel="Manage ↗"
                    actionHref={p.config.stakePageUrl}
                    iconUrl={p.config.iconUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {expanded && (
            <>
              <Row label={
                <span className="inline-flex items-center gap-1.5">
                  <CurrencyLogo currency={currency0} size="16px" /> Pooled {symbol0}
                </span>
              }>
                {token0Deposited ? (
                  <span>
                    {formatNumber(token0Deposited.toSignificant(4))}
                    {token0Price > 0 && (
                      <span style={{ color: '#978A80', marginLeft: 6 }}>
                        ({formatPrice(token0Price * Number(token0Deposited.toSignificant(4)))})
                      </span>
                    )}
                  </span>
                ) : '—'}
              </Row>

              <Row label={
                <span className="inline-flex items-center gap-1.5">
                  <CurrencyLogo currency={currency1} size="16px" /> Pooled {symbol1}
                </span>
              }>
                {token1Deposited ? (
                  <span>
                    {formatNumber(token1Deposited.toSignificant(4))}
                    {token1Price > 0 && (
                      <span style={{ color: '#978A80', marginLeft: 6 }}>
                        ({formatPrice(token1Price * Number(token1Deposited.toSignificant(4)))})
                      </span>
                    )}
                  </span>
                ) : '—'}
              </Row>

              {pairAccount && (
                <>
                  <div style={{ borderTop: '1px solid #2F2823', margin: '4px 0' }} />
                  <PortfolioRow label="LPing portfolio" value={pairAccount.lpPortfolio} />
                  {!isMainnet && (
                    <PortfolioRow label="HODL portfolio" value={pairAccount.bnhPortfolio} />
                  )}
                  <PortfolioRow colored label="LPing PnL" value={pairAccount.unrealizedPnL} base={pairAccount.basePortfolio} />
                  {!isMainnet && (
                    <>
                      <PortfolioRow colored label="HODL PnL" value={pairAccount.bnhPortfolio - pairAccount.basePortfolio} base={pairAccount.basePortfolio} />
                      <PortfolioRow colored label="LPing vs. HODL" value={pairAccount.lpPortfolio - pairAccount.bnhPortfolio} />
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {account && hasLiquidity && expanded && (
        <div className="pt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                if (!guard.matches) {
                  await guard.switchToTarget()
                  return
                }
                navigate(`/add/${orderedCurrencyIds(currency0, currency1, chainId).join("/")}`)
              }}
              disabled={guard.isSwitching}
              className="inline-flex items-center justify-center flex-1"
              style={{
                background: '#985C2A',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                cursor: guard.isSwitching ? 'wait' : 'pointer',
                opacity: guard.isSwitching ? 0.7 : 1,
              }}
            >
              {guard.matches ? 'Add' : `Switch to ${guard.targetChainName}`}
            </button>
            {hasWalletLp ? (
              <button
                type="button"
                onClick={async () => {
                  if (!guard.matches) {
                    await guard.switchToTarget()
                    return
                  }
                  navigate(`/remove/${orderedCurrencyIds(currency0, currency1, chainId).join("/")}`)
                }}
                disabled={guard.isSwitching}
                className="inline-flex items-center justify-center flex-1"
                style={{
                  background: 'transparent',
                  border: '1px solid #493E35',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#FBFBFD',
                  cursor: guard.isSwitching ? 'wait' : 'pointer',
                  opacity: guard.isSwitching ? 0.7 : 1,
                }}
              >
                {guard.matches ? 'Remove' : `Switch to ${guard.targetChainName}`}
              </button>
            ) : (
              <span
                title="Your LP is staked. Unstake on the platform below first, then return here to remove liquidity."
                className="inline-flex items-center justify-center flex-1 cursor-not-allowed"
                style={{
                  background: 'transparent',
                  border: '1px solid #2F2823',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#6B6059',
                }}
              >
                Remove
              </span>
            )}
          </div>
          {!hasWalletLp && hasStakedLp && (
            <div
              className="text-center"
              style={{
                fontFamily: 'Inter',
                fontSize: '11px',
                color: '#978A80',
                lineHeight: '16px',
              }}
            >
              Unstake your LP first to enable Remove.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SubRow({
  label,
  amount,
  actionLabel,
  actionHref,
  iconUrl,
}: {
  label: string
  amount: TokenAmount
  actionLabel?: string
  actionHref?: string
  iconUrl?: string
}) {
  return (
    <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: '12px' }}>
      <span className="inline-flex items-center gap-1.5" style={{ color: '#978A80' }}>
        {iconUrl && (
          <img src={iconUrl} alt="" style={{ width: 14, height: 14, borderRadius: 4 }} />
        )}
        {label}
      </span>
      <span className="inline-flex items-center gap-2" style={{ color: '#FBFBFD' }}>
        {formatNumber(amount.toSignificant(6))}
        {actionHref && (
          <a
            href={actionHref}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:opacity-80"
            style={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 500,
              color: '#D8A072',
            }}
          >
            {actionLabel ?? 'Manage ↗'}
          </a>
        )}
      </span>
    </div>
  )
}

function PositionSkeletonRow({ w }: { w: number }) {
  return (
    <div className="flex justify-between items-center">
      <div
        className="animate-pulse rounded"
        style={{ background: '#493E35', height: 12, width: 90 }}
      />
      <div
        className="animate-pulse rounded"
        style={{ background: '#493E35', height: 12, width: w }}
      />
    </div>
  )
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: '13px', color: '#FBFBFD' }}>
      <span style={{ color: '#CFC7C1' }}>{label}</span>
      <span>{children}</span>
    </div>
  )
}

function PortfolioRow({
  label,
  value,
  base,
  colored,
}: {
  label: string
  value: number
  base?: number
  colored?: boolean
}) {
  const abs = Math.abs(value)
  const color = colored
    ? abs < 0.01
      ? '#8A7D66'
      : value > 0
      ? '#83CF84'
      : '#E57373'
    : '#FBFBFD'
  const pct =
    abs >= 0.01 && base !== undefined && Math.abs(base) >= 0.01
      ? ` (${((value * 100) / base).toFixed(2)}%)`
      : ''
  return (
    <div className="flex justify-between items-center" style={{ fontFamily: 'Inter', fontSize: '13px' }}>
      <span style={{ color: '#CFC7C1' }}>{label}</span>
      <span style={{ color }}>
        {abs >= 0.01 ? formatPrice(value) : '~ $0'}
        {pct}
      </span>
    </div>
  )
}
