import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'
import { ROUTER_ADDRESS_V1, ROUTER_ADDRESS_V3 } from 'lib/sdk/constants/addresses'

type Props = {
  isMobile?: boolean
}

const SwitchVersion = ({ isMobile }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { appVersion: version, isDisabled, switchVersion } = useVersion({ chainId })

  const hasV1 = !!ROUTER_ADDRESS_V1[chainId]
  const hasV3 = !!ROUTER_ADDRESS_V3[chainId]
  const versions = [hasV1 ? 1 : null, 2, hasV3 ? 3 : null].filter((v): v is number => v !== null)

  const handleSelect = (v: number) => {
    if (isDisabled || v === version) return
    switchVersion(v)
    setTimeout(() => location.reload(), 200)
  }

  if (isDisabled || versions.length <= 1) return null

  return (
    <div
      className={`flex items-center gap-0.5 ${isMobile ? 'md:hidden' : 'max-md:hidden'}`}
    >
      {versions.map((v) => (
        <button
          key={v}
          onClick={() => handleSelect(v)}
          className={`px-2.5 py-1 text-xs font-bold transition-all rounded-[6px] ${
            version === v
              ? 'bg-[#c4943a] text-white'
              : 'bg-transparent border border-[#c4943a40] text-[#8A7D66] hover:text-white'
          } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          V{v}
        </button>
      ))}
    </div>
  )
}

export default SwitchVersion
