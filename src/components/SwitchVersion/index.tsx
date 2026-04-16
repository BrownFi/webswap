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
      className={`flex items-center gap-0.5 p-[4px] rounded-[12px] ${isMobile ? 'hidden' : ''}`}
      style={{
        background: 'rgba(0, 0, 0, 0.06)',
        boxShadow: 'inset 0px 10px 14px rgba(237, 210, 188, 0.05), inset 0px 2px 16px rgba(236, 208, 186, 0.3)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {versions.map((v) => (
        <button
          key={v}
          onClick={() => handleSelect(v)}
          className={`transition-all ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            padding: '4px 8px',
            borderRadius: '8px',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: version === v ? 400 : 500,
            color: 'white',
            background: version === v ? '#985C2A' : 'transparent',
          }}
        >
          V{v}
        </button>
      ))}
    </div>
  )
}

export default SwitchVersion
