// CLMM sub-app entry, mounted at /clmm/* inside webswap's BrowserRouter so it
// shares webswap's wagmi + RainbowKit wallet (one session, no reload). Uses
// CLMM's own Layout (header/footer/nav) — webswap hides its chrome on /clmm.
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ApolloProvider from './providers/ApolloProvider'
import StoreCleaner from './providers/StoreCleaner'
import Layout from './components/common/Layout'
import { SwapPageView } from './pages/Swap/types'
// Pre-compiled + .clmm-root-scoped Tailwind 4 CSS. Imported raw to bypass
// webswap's Tailwind-3 PostCSS pipeline (which can't parse TW4 @layer output),
// then injected as a scoped <style> only while CLMM is mounted.
import clmmCss from './clmm.generated.css?raw'

const SwapPage = lazy(() => import('./pages/Swap'))
const PoolsPage = lazy(() => import('./pages/Pools'))
const PoolPage = lazy(() => import('./pages/Pool'))
const CreatePoolPage = lazy(() => import('./pages/CreatePool'))
const NewPositionPage = lazy(() => import('./pages/NewPosition'))

const s = (n: React.ReactNode) => <Suspense fallback={null}>{n}</Suspense>

export default function ClmmApp() {
  return (
    <ApolloProvider>
      <style dangerouslySetInnerHTML={{ __html: clmmCss }} />
      <div className="clmm-root">
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
      </div>
      <StoreCleaner />
    </ApolloProvider>
  )
}
