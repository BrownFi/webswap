import { isMainnet } from 'connectors'

type SwitchZapProps = {
  enabled: boolean
  onToggle: () => void
}

export const SwitchZap = ({ enabled, onToggle }: SwitchZapProps) => {
  if (isMainnet) return null
  return (
    <div
      onClick={onToggle}
      className={
        `relative w-[88px] h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center justify-between px-2 ` +
        `${enabled ? 'bg-[#773030]' : 'bg-[#77303088]'} cursor-pointer`
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
