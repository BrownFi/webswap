// Shim for `@reown/appkit-adapter-wagmi` — only referenced by the standalone
// WagmiProvider (unreachable in the webswap integration; CLMM uses webswap's
// RainbowKit config). Stub so any stray import resolves.
export class WagmiAdapter {
  wagmiConfig: any = undefined
  constructor(_opts?: any) {}
}
