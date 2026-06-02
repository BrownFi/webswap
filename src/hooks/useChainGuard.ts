/**
 * Cross-chain action helper. Components that need to act on a specific
 * chain (e.g. add liquidity to a Bera pool) but the wallet is on a
 * different chain (Monad) use this to:
 *
 *   1. Know whether the wallet's chain matches the target (`matches`)
 *   2. Render appropriate copy via `targetChainName`
 *   3. Trigger a wallet switch via `switchToTarget()` — wraps
 *      wagmi.switchChain with the right error handling
 *
 * Pattern (mirrors Uniswap multi-chain): user navigates freely to any
 * pool's detail page regardless of wallet chain. Browsing always works
 * because the URL carries chainId. When the user wants to ACT (add LP,
 * remove LP, swap), the action button morphs to "Switch to {chain}" if
 * `matches === false` — calling the morphed handler triggers the chain
 * switch instead of the normal action.
 *
 * After a successful switch wagmi's chainId updates synchronously, the
 * component re-renders, and the button restores its normal CTA.
 */
import { useMemo, useCallback } from 'react'
import { useSwitchChain } from 'wagmi'
import { useActiveWeb3React } from 'hooks'
import { availableChains } from 'connectors'

interface ChainGuard {
  /** True if the wallet is currently on the target chain. */
  matches: boolean
  /** Human-readable name of the target chain ("Berachain", "Monad", …). */
  targetChainName: string
  /** Icon URL of the target chain — handy for the banner UI. */
  targetChainIconUrl?: string
  /** Triggers the wallet switch popup. Resolves after the user accepts
   *  or rejects; component can await it before navigating. */
  switchToTarget: () => Promise<void>
  /** True while the wallet's switch popup is open and unresolved. */
  isSwitching: boolean
}

export function useChainGuard(targetChainId: number | undefined): ChainGuard {
  const { chainId: walletChainId } = useActiveWeb3React()
  const { switchChainAsync, isPending } = useSwitchChain()

  const target = useMemo(
    () => availableChains.find((c) => c.id === targetChainId),
    [targetChainId],
  )

  const matches = !!targetChainId && walletChainId === targetChainId

  const switchToTarget = useCallback(async () => {
    if (!targetChainId || matches) return
    try {
      await switchChainAsync({ chainId: targetChainId })
    } catch {
      // Silently swallow — user-rejection (code 4001) and chain-not-added
      // errors are both fine; the calling component checks `matches` again
      // on the next render to decide what to show. We don't propagate the
      // error because the action button click already lives in a UX where
      // "user said no" is the normal exit path.
    }
  }, [targetChainId, matches, switchChainAsync])

  return {
    matches,
    targetChainName: (target?.name as string | undefined) ?? 'this chain',
    targetChainIconUrl: target?.iconUrl as string | undefined,
    switchToTarget,
    isSwitching: isPending,
  }
}
