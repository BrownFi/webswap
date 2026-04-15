import { isMainnet } from 'connectors'

type SwitchZapProps = {
  enabled: boolean
  onToggle: () => void
  version?: number
}

export const SwitchZap = ({ enabled, onToggle, version }: SwitchZapProps) => {
  // V3: always show zap toggle (not gated by mainnet)
  // V2 and below: keep existing behavior
  if (version !== 3 && isMainnet) return null
  return (
    <div
      onClick={onToggle}
      className={
        `relative w-[88px] h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center justify-between px-2 ` +
        `${enabled ? 'bg-[#c4943a]' : 'bg-[#c4943a88]'} cursor-pointer`
      }
    >
      {enabled ? (
        <span className="text-xs font-bold text-white select-none w-12 text-center">Zap</span>
      ) : (
        <span className="text-xs font-bold text-white select-none w-full text-right">Classic</span>
      )}
      <div
        className={
          `absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ` +
          `${enabled ? 'translate-x-14' : ''} bg-white`
        }
      ></div>
    </div>
  )
}
