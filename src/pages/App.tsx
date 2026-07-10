import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import 'rc-slider/assets/index.css'
import 'theme/fonts.css'
import 'theme/index.css'
import styled from 'styled-components'
import GoogleAnalyticsReporter from 'components/analytics/GoogleAnalyticsReporter'
import Popups from 'components/Popups'
import { RouteErrorBoundary } from 'components/RouteErrorBoundary'

import DarkModeQueryParamReader from 'theme/DarkModeQueryParamReader'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './AddLiquidity/redirects'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
const Swap = lazy(() => import('./Swap'))
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import StaticScreen from 'containers/StaticScreen'

const Pool = lazy(() => import('./Pool'))
const PoolFinder = lazy(() => import('./PoolFinder'))
const AddLiquidity = lazy(() => import('./AddLiquidity'))
const RemoveLiquidity = lazy(() => import('./RemoveLiquidity'))
const PoolDetail = lazy(() => import('./Pool/Detail'))
const Portfolio = lazy(() => import('./Portfolio'))
// CLMM (Algebra fork) sub-app — isolated under src/clmm, mounted at /clmm/*.
const ClmmApp = lazy(() => import('@clmm/ClmmApp'))

const BodyWrapper = styled.div<{ $noPad?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  padding-top: 120px;
  align-items: center;
  flex: 1;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding: 16px 12px;
    padding-top: 120px;
    padding-bottom: 40px;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding-bottom: 100px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 8px 8px;
    padding-top: 100px;
    padding-bottom: 100px;
  `};

  /* CLMM renders its own header/footer chrome; drop webswap's body padding there. */
  ${({ $noPad }) => $noPad && `padding: 0 !important;`}
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
            <Route
              path="/clmm/*"
              element={
                <RouteErrorBoundary>
                  <ClmmApp />
                </RouteErrorBoundary>
              }
            />
            <Route path="/" element={<Navigate to="/swap" replace />} />
            <Route path="/home" element={<Navigate to="/swap" replace />} />
            <Route
              path="/swap"
              element={
                <RouteErrorBoundary>
                  <Swap />
                </RouteErrorBoundary>
              }
            />
            <Route path="/claim" element={<OpenClaimAddressModalAndRedirectToSwap />} />
            <Route path="/swap/:outputCurrency" element={<RedirectToSwap />} />
            <Route path="/send" element={<RedirectPathToSwapOnly />} />
            <Route
              path="/find"
              element={
                <RouteErrorBoundary fallbackPath="/pool">
                  <PoolFinder />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/pool"
              element={
                <RouteErrorBoundary>
                  <Pool />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/portfolio"
              element={
                <RouteErrorBoundary>
                  <Portfolio />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/pool/:chainId/:pairAddress"
              element={
                <RouteErrorBoundary fallbackPath="/pool">
                  <PoolDetail />
                </RouteErrorBoundary>
              }
            />
            <Route path="/create" element={<RedirectToAddLiquidity />} />
            <Route
              path="/add"
              element={
                <RouteErrorBoundary fallbackPath="/pool">
                  <AddLiquidity />
                </RouteErrorBoundary>
              }
            />
            <Route path="/add/:currencyIdA" element={<RedirectOldAddLiquidityPathStructure />} />
            <Route
              path="/add/:currencyIdA/:currencyIdB"
              element={
                <RouteErrorBoundary fallbackPath="/pool">
                  <RedirectDuplicateTokenIds />
                </RouteErrorBoundary>
              }
            />
            <Route path="/remove/:tokens" element={<RedirectOldRemoveLiquidityPathStructure />} />
            <Route
              path="/remove/:currencyIdA/:currencyIdB"
              element={
                <RouteErrorBoundary fallbackPath="/pool">
                  <RemoveLiquidity />
                </RouteErrorBoundary>
              }
            />
            <Route path="*" element={<RedirectPathToSwapOnly />} />
          </Routes>

        </BodyWrapper>
      </StaticScreen>
    </Suspense>
  )
}
