import { DEFAULT_CHAIN_ID } from "@clmm/config";
// CLMM sub-app entry, mounted at /clmm/* inside webswap's BrowserRouter so it
// shares webswap's wagmi + RainbowKit wallet (one session, no reload). Uses
// CLMM's own Layout (header/footer/nav) — webswap hides its chrome on /clmm.
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import ApolloProvider from './providers/ApolloProvider'
import StoreCleaner from './providers/StoreCleaner'
import Layout from './components/common/Layout'
import { SwapPageView } from './pages/Swap/types'
// CLMM's Tailwind 3 stylesheet, compiled in-tree by webswap's PostCSS and scoped
// under .clmm-root (see src/clmm/clmm.css + postcss.config.js).
import './clmm.css'

const HEMI_CHAIN_ID = 43111

const SwapPage = lazy(() => import('./pages/Swap'))
const PoolsPage = lazy(() => import('./pages/Pools'))
const PoolPage = lazy(() => import('./pages/Pool'))
const CreatePoolPage = lazy(() => import('./pages/CreatePool'))
const NewPositionPage = lazy(() => import('./pages/NewPosition'))

// Analytics module (enabled in app-modules). AnalyticsPage is a layout that wraps
// the per-tab table as children, so eager-import rather than lazy — it's part of
// the CLMM chunk that's already lazy-loaded.
import AnalyticsPage from './pages/Analytics'
import PoolsList from './components/pools/PoolsList'
import AnalyticsModule from './modules/AnalyticsModule'
const { TokensList, TransactionsList, AnalyticsPoolPage, AnalyticsTokenPage } = AnalyticsModule.components

// Reserve vertical space while a lazy page chunk loads so the footer/layout
// doesn't collapse then expand (avoids a jump between CLMM pages).
const s = (n: React.ReactNode) => <Suspense fallback={<div className="min-h-[70vh] w-full" />}>{n}</Suspense>

// CLMM's contracts/tokens are Hemi-only. CLMM hooks index chain-keyed maps
// (TOKENS[DEFAULT_CHAIN_ID], WNATIVE[...], graphql clients, etc.) which only
// have a Hemi entry — but they also read the wallet's live chain (balances,
// tx sending) via wagmi. If we let CLMM render while the wallet is on a non-Hemi
// chain, those wallet reads point at the wrong network and swaps/liquidity
// target the wrong chain. Gate the whole sub-app on Hemi and prompt to
// connect / switch otherwise, so children only ever mount on chain 43111.
function HemiGate({ children }: { children: React.ReactNode }) {
  const { chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const { openConnectModal } = useConnectModal()

  // Render CLMM when on Hemi OR when disconnected: with no wallet there's no live
  // chain to mis-target (balances are empty, nothing can be sent), and the CLMM
  // pages show their own Connect button. Only block a wallet that's CONNECTED to a
  // non-Hemi chain, where balance/tx reads would hit the wrong network.
  if (chainId === HEMI_CHAIN_ID || !isConnected) return <>{children}</>

  const onClick = () => {
    if (!isConnected) openConnectModal?.()
    else switchChain?.({ chainId: HEMI_CHAIN_ID })
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[70vh] w-full px-4 text-center">
      <h2 className="text-2xl font-semibold text-text-100">BrownFi CLMM runs on Hemi</h2>
      <p className="text-text-200 max-w-md">
        Concentrated liquidity on Hemi. {isConnected ? 'Switch your wallet to Hemi to continue.' : 'Connect your wallet to continue.'}
      </p>
      <button
        onClick={onClick}
        className="mt-2 rounded-lg px-6 py-3 font-medium text-primary-300 bg-primary-100 hover:bg-primary-200 transition-colors"
      >
        {isConnected ? 'Switch to Hemi' : 'Connect Wallet'}
      </button>
    </div>
  )
}

export default function ClmmApp() {
  return (
    <ApolloProvider>
      <div className="clmm-root w-full" style={{ minWidth: 0, maxWidth: '100%', display: 'block' }}>
        <HemiGate>
          <Layout>
            <Routes>
              <Route index element={<Navigate replace to="swap" />} />
              <Route path="swap" element={s(<SwapPage type={SwapPageView.SWAP} />)} />
              <Route path="pools" element={s(<PoolsPage />)} />
              <Route path="pools/create" element={s(<CreatePoolPage />)} />
              <Route path="pool/:pool" element={s(<PoolPage />)} />
              <Route path="pool/:pool/new-position" element={s(<NewPositionPage />)} />
              <Route path="analytics" element={s(<AnalyticsPage><PoolsList isExplore /></AnalyticsPage>)} />
              <Route path="analytics/tokens" element={s(<AnalyticsPage><TokensList /></AnalyticsPage>)} />
              <Route path="analytics/transactions" element={s(<AnalyticsPage><TransactionsList /></AnalyticsPage>)} />
              <Route path="analytics/tokens/:tokenId" element={s(<AnalyticsTokenPage />)} />
              <Route path="analytics/pools/:poolId" element={s(<AnalyticsPoolPage />)} />
              <Route path="*" element={<Navigate replace to="swap" />} />
            </Routes>
          </Layout>
        </HemiGate>
      </div>
      <StoreCleaner />
    </ApolloProvider>
  )
}
