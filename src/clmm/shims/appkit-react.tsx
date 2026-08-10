// Shim: maps the CLMM code's `@reown/appkit/react` calls onto webswap's shared
// RainbowKit + wagmi wallet, so the ported UI keeps ONE wallet session across the
// nav (no reconnect). Aliased in vite.config.ts.
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export function useAppKit() {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()

  const open = (opts?: { view?: string }) => {
    // CLMM calls open({ view: 'Networks' }) to switch chains.
    if (opts?.view === 'Networks') {
      openChainModal?.()
      return
    }
    // Generic connect; when already connected, show the account modal.
    if (openConnectModal) {
      openConnectModal()
      return
    }
    openAccountModal?.()
  }

  return { open }
}

export function useAppKitNetwork() {
  const { chain, chainId } = useAccount()
  // CLMM reads `chainId` (number) and `caipNetwork` (expects a viem-Chain-like
  // object with id / blockExplorers). wagmi's `chain` fits both usages.
  return { chainId, caipNetwork: chain }
}
