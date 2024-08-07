import React from 'react'
import { StarknetConfig, argent, braavos, publicProvider, useInjectedConnectors } from '@starknet-react/core'
import { mainnet, sepolia } from '@starknet-react/chains'

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [sepolia, mainnet]
  const provider = publicProvider()
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'alphabetical'
  })
  return (
    <StarknetConfig chains={chains} provider={provider} connectors={connectors} autoConnect>
      {children}
    </StarknetConfig>
  )
}
