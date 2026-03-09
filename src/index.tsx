import 'inter-ui'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Blocklist from 'components/Blocklist'
import './i18n'
import App from 'pages/App'
import store from 'state'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import ApplicationUpdater from 'state/application/updater'
import ListsUpdater from 'state/lists/updater'
import MulticallUpdater from 'state/multicall/updater'
import TransactionUpdater from 'state/transactions/updater'
import UserUpdater from 'state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from 'services/queryClient'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from 'connectors'
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { ToastProvider } from 'containers/ToastProvider'
import { ErrorBoundary } from 'containers/ErrorBoundary'

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = ['REACT_APP_API_URL', 'REACT_APP_API_V2_URL'] as const
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
}

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

const publicUrl = process.env.PUBLIC_URL
const routerBasename = !publicUrl || publicUrl === '.' || publicUrl === '/' ? undefined : publicUrl

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Provider store={store}>
      <BrowserRouter basename={routerBasename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>
              <Blocklist>
                <Updaters />
                <ThemeProvider>
                  <ToastProvider>
                    <ThemedGlobalStyle />
                    <ErrorBoundary>
                      <App />
                    </ErrorBoundary>
                  </ToastProvider>
                </ThemeProvider>
              </Blocklist>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

serviceWorkerRegistration.unregister()
