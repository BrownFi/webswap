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
// Pre-compiled + .clmm-root-scoped Tailwind 4 CSS. Imported raw to bypass
// webswap's Tailwind-3 PostCSS pipeline (which can't parse TW4 @layer output),
// then injected as a scoped <style> only while CLMM is mounted.
import clmmCss from './clmm.generated.css?raw'

const HEMI_CHAIN_ID = 43111

const SwapPage = lazy(() => import('./pages/Swap'))
const PoolsPage = lazy(() => import('./pages/Pools'))
const PoolPage = lazy(() => import('./pages/Pool'))
const CreatePoolPage = lazy(() => import('./pages/CreatePool'))
const NewPositionPage = lazy(() => import('./pages/NewPosition'))

// Reserve vertical space while a lazy page chunk loads so the footer/layout
// doesn't collapse then expand (avoids a jump between CLMM pages).
const s = (n: React.ReactNode) => <Suspense fallback={<div className="min-h-[70vh] w-full" />}>{n}</Suspense>

// CLMM's contracts/tokens are Hemi-only, and CLMM hooks read TOKENS[chainId] /
// WNATIVE[chainId]. When the wallet isn't on Hemi, useChainId() returns
// webswap's active chain and those lookups are undefined -> crash. Gate the
// whole sub-app on Hemi and prompt to connect / switch otherwise.
function HemiGate({ children }: { children: React.ReactNode }) {
  const { chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const { openConnectModal } = useConnectModal()

  if (chainId === HEMI_CHAIN_ID) return <>{children}</>

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
      <style dangerouslySetInnerHTML={{ __html: clmmCss }} />
      <div className="clmm-root w-full">
        <HemiGate>
          <Layout>
            <Routes>
              <Route index element={<Navigate replace to="swap" />} />
              <Route path="swap" element={s(<SwapPage type={SwapPageView.SWAP} />)} />
              <Route path="pools" element={s(<PoolsPage />)} />
              <Route path="pools/create" element={s(<CreatePoolPage />)} />
              <Route path="pool/:pool" element={s(<PoolPage />)} />
              <Route path="pool/:pool/new-position" element={s(<NewPositionPage />)} />
              <Route path="*" element={<Navigate replace to="swap" />} />
            </Routes>
          </Layout>
        </HemiGate>
      </div>
      <StoreCleaner />
    </ApolloProvider>
  )
}
