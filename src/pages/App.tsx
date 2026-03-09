import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import 'rc-slider/assets/index.css'
import 'theme/index.css'
import styled from 'styled-components'
import GoogleAnalyticsReporter from 'components/analytics/GoogleAnalyticsReporter'
import Popups from 'components/Popups'

import DarkModeQueryParamReader from 'theme/DarkModeQueryParamReader'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './AddLiquidity/redirects'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import StaticScreen from 'containers/StaticScreen'

const Pool = lazy(() => import('./Pool'))
const PoolFinder = lazy(() => import('./PoolFinder'))
const AddLiquidity = lazy(() => import('./AddLiquidity'))
const RemoveLiquidity = lazy(() => import('./RemoveLiquidity'))
const Leaderboard = lazy(() => import('./Leaderboard'))

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding: 16px 12px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsReporter />
      <DarkModeQueryParamReader />
      <StaticScreen>
        <BodyWrapper>
          <Popups />
          <Routes>
            <Route path="/swap" element={<Swap />} />
            <Route path="/claim" element={<OpenClaimAddressModalAndRedirectToSwap />} />
            <Route path="/swap/:outputCurrency" element={<RedirectToSwap />} />
            <Route path="/send" element={<RedirectPathToSwapOnly />} />
            <Route path="/find" element={<PoolFinder />} />
            <Route path="/pool" element={<Pool />} />
            <Route path="/campaign/contest-1" element={<Leaderboard />} />
            <Route path="/create" element={<RedirectToAddLiquidity />} />
            <Route path="/add" element={<AddLiquidity />} />
            <Route path="/add/:currencyIdA" element={<RedirectOldAddLiquidityPathStructure />} />
            <Route path="/add/:currencyIdA/:currencyIdB" element={<RedirectDuplicateTokenIds />} />
            <Route path="/remove/:tokens" element={<RedirectOldRemoveLiquidityPathStructure />} />
            <Route path="/remove/:currencyIdA/:currencyIdB" element={<RemoveLiquidity />} />
            <Route path="*" element={<RedirectPathToSwapOnly />} />
          </Routes>

          {/* <div
            className={classNames(
              'max-w-[500px] bg-[#1d1c21] w-full p-[32px] mt-[20px]',
              location.pathname?.indexOf('/pool') !== -1 && '!max-w-[894px]'
            )}
          >
            <Referral />
          </div> */}
          <Marginer />
        </BodyWrapper>
      </StaticScreen>
    </Suspense>
  )
}
