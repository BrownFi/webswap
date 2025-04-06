import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import 'inter-ui'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import Blocklist from './components/Blocklist'
import { NetworkContextName } from './constants'
import './i18n'
import App from './pages/App'
import store from './state'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'
import { StarknetProvider } from './starknet-provider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from 'services/queryClient'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from 'connectors'
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
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
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>
              <StarknetProvider>
                <Blocklist>
                  <Provider store={store}>
                    <Updaters />
                    <ThemeProvider>
                      <ThemedGlobalStyle />
                      <HashRouter>
                        <App />
                      </HashRouter>
                    </ThemeProvider>
                  </Provider>
                </Blocklist>
              </StarknetProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>
)

serviceWorkerRegistration.unregister()
