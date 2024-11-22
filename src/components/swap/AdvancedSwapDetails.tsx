import { Trade, TradeType } from '@brownfi/sdk'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeveritySlippage } from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import SwapRoute from './SwapRoute'
import { formatStringToNumber, getTokenSymbol } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { ErrorText } from './styleds'

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const theme = useContext(ThemeContext)
  const { realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)
  const { chainId } = useActiveWeb3React()
  return (
    <>
      <AutoColumn style={{ padding: '0 16px' }}>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.white}>
              {isExactIn ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.white} fontSize={14}>
              {isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${getTokenSymbol(
                    trade.outputAmount?.currency,
                    chainId
                  )}` ?? '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${getTokenSymbol(
                    trade.inputAmount?.currency,
                    chainId
                  )}` ?? '-'}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.white}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="Price impact is the difference between your trading price and oracle price." />
          </RowFixed>
          <ErrorText fontWeight={500} fontSize={14} severity={warningSeveritySlippage(trade?.slippage || 0)}>
            {trade ? formatStringToNumber(trade?.slippage) : '-'}%
          </ErrorText>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.white}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.white}>
            {realizedLPFee
              ? `${realizedLPFee.toSignificant(4)} ${getTokenSymbol(trade.inputAmount?.currency, chainId)}`
              : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext)

  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <AutoColumn gap="0px">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <RowBetween style={{ padding: '0 16px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.white}>
                    Route
                  </TYPE.black>
                  <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                </span>
                <SwapRoute trade={trade} />
              </RowBetween>
            </>
          )}
        </>
      )}
    </AutoColumn>
  )
}
