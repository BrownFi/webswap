// Integration shim. Standalone CLMM had its own AppKit-based wagmi config here;
// in webswap, CLMM shares webswap's RainbowKit wagmiConfig. CLMM hooks/utils
// import `wagmiConfig` from this module for imperative wagmi-core reads
// (readContract, getPositionFees, etc.) — re-export webswap's so those reads run
// on the same shared client/connection. The default provider component is unused
// in the integration (webswap mounts WagmiProvider/RainbowKit at the root).
import { wagmiConfig as webswapWagmiConfig } from '../../connectors'

export const wagmiConfig = webswapWagmiConfig

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
