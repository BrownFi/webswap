import { StrictMode } from 'react'

import { ApolloProvider } from '@apollo/client'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import 'inter-ui'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import { StarknetProvider } from 'starknet-provider'
import { WagmiProvider } from 'wagmi'

import App from 'pages/App'

import Blocklist from 'components/Blocklist'
import { ErrorBoundary } from 'containers/ErrorBoundary'
import { ToastProvider } from 'containers/ToastProvider'

import { wagmiConfig } from 'connectors'
import { apolloClient } from 'services/apolloClient'
import { queryClient } from 'services/queryClient'

import store from 'state'
import ApplicationUpdater from 'state/application/updater'
import ListsUpdater from 'state/lists/updater'
import MulticallUpdater from 'state/multicall/updater'
import TransactionUpdater from 'state/transactions/updater'
import UserUpdater from 'state/user/updater'

import { NetworkContextName } from 'constants/common'
import getLibrary from 'utils/getLibrary'

import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'

import './i18n'

import '@rainbow-me/rainbowkit/styles.css'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

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

const root = ReactDOM.createRoot(document.getElementById('root') as any)
root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Provider store={store}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <WagmiProvider config={wagmiConfig}>
            <ApolloProvider client={apolloClient}>
              <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                  <StarknetProvider>
                    <Blocklist>
                      <Updaters />
                      <ThemeProvider>
                        <ToastProvider>
                          <ThemedGlobalStyle />
                          <HashRouter>
                            <ErrorBoundary>
                              <App />
                            </ErrorBoundary>
                          </HashRouter>
                        </ToastProvider>
                      </ThemeProvider>
                    </Blocklist>
                  </StarknetProvider>
                </RainbowKitProvider>
              </QueryClientProvider>
            </ApolloProvider>
          </WagmiProvider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </Provider>
  </StrictMode>,
)

serviceWorkerRegistration.unregister()
