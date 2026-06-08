import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'
import { isV3Enabled } from 'connectors'
import { ROUTER_ADDRESS_V3 } from 'lib/sdk/constants/addresses'

type Props = {
  isMobile?: boolean
}

const SwitchVersion = ({ isMobile }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { appVersion: version, isDisabled, switchVersion } = useVersion({ chainId })

  // V1 has been retired — toggle only exposes V2 (and V3 where available).
  const hasV3 = !!ROUTER_ADDRESS_V3[chainId]
  const versions = [2, hasV3 ? 3 : null].filter((v): v is number => v !== null)

  const handleSelect = (v: number) => {
    if (isDisabled || v === version) return
    switchVersion(v)
    setTimeout(() => location.reload(), 200)
  }

  // Hide when V3 isn't available (production API doesn't have /indexer/v3).
  // Beta-branded deployments pointing at prod API also hit this — capability
  // follows VITE_API_URL, not VITE_ENVIRONMENT.
  if (!isV3Enabled) return null
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
