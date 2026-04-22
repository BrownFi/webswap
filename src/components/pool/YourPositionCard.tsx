import { JSBI, Pair, Percent } from '@brownfi/sdk'
import { Link } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks'
import { useTotalSupply } from 'data/TotalSupply'
import { useTokenBalance } from 'state/wallet/hooks'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { Loader } from 'components/Loader'
import { isMainnet } from 'connectors'
import { getTokenSymbol } from 'utils'
import { currencyId } from 'utils/currencyId'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { formatNumber, formatPrice } from 'utils/prices'
import { usePythPrices } from 'hooks/usePythPrices'
import { PairStats, usePoolStats } from 'components/PositionCard/usePoolStats'
import ConnectWallet from 'components/ConnectWallet'

type Props = {
  pair: Pair
  pairStats?: PairStats
}

export function YourPositionCard({ pair, pairStats }: Props) {
  const { account, chainId } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!totalPoolTokens && !!userPoolBalance && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
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

  const hasLiquidity =
    userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0))

  return (
    <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '16px', padding: '20px' }}>
      <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '16px', color: '#FBFBFD', marginBottom: '16px' }}>
        Your position
      </div>

      {!account ? (
        <ConnectWallet />
      ) : !hasLiquidity ? (
        <>
          <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#978A80', lineHeight: '20px', marginBottom: '12px' }}>
            You don&apos;t have liquidity in this pool yet.
          </div>
          <Link
            to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
            className="no-underline inline-flex items-center justify-center w-full"
            style={{
              background: '#985C2A',
              borderRadius: '10px',
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
          <Row label="LP tokens">
            {poolTokenPercentage ? (
              <span>
                {userPoolBalance ? formatNumber(userPoolBalance.toSignificant(6)) : '0'}
                <span style={{ color: '#978A80', marginLeft: 6 }}>
                  ({poolTokenPercentage.toFixed(2) === '0.00' ? '0' : poolTokenPercentage.toFixed(2)}%)
                </span>
              </span>
            ) : (
              <Loader stroke="gray" />
            )}
          </Row>

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
        </div>
      )}

      {account && hasLiquidity && (
        <div className="pt-3 flex gap-2">
          <Link
            to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
            className="no-underline inline-flex items-center justify-center flex-1"
            style={{
              background: '#985C2A',
              borderRadius: '10px',
              padding: '10px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 500,
              color: '#FFFFFF',
            }}
          >
            Add
          </Link>
          <Link
            to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
            className="no-underline inline-flex items-center justify-center flex-1"
            style={{
              background: 'transparent',
              border: '1px solid #493E35',
              borderRadius: '10px',
              padding: '10px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 500,
              color: '#FBFBFD',
            }}
          >
            Remove
          </Link>
        </div>
      )}
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
