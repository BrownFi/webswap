import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'
import { isMainnet } from 'connectors'
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

  // Hide on mainnet — production shows V2 only
  if (isMainnet) return null
  if (isDisabled || versions.length <= 1) return null

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${isMobile ? 'hidden' : ''}`}
      style={{
        background: '#2F2823',
        border: '1px solid #493E35',
        borderRadius: '999px',
        padding: '2px',
        height: '30px',
      }}
    >
      {versions.map((v) => (
        <button
          key={v}
          onClick={() => handleSelect(v)}
          className={`transition-colors ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            padding: '0 10px',
            height: '100%',
            borderRadius: '999px',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            color: version === v ? '#FFFFFF' : '#978A80',
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
