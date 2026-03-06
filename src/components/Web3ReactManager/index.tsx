/**
 * Connection management is now handled by wagmi/RainbowKit.
 * This component is kept as a pass-through to avoid changing the App tree structure.
 */
export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  return children
}
