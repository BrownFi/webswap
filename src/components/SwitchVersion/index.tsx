import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'
import { isV3Enabled } from 'connectors'
import { hasV3Pilot, hasV3Official } from 'lib/sdk/constants/addresses'

type Props = {
  isMobile?: boolean
}

// version 3 = V3 Pilot (pre-v3-final), version 4 = V3 Official (v3-final).
type Option = { label: string; version: number }

const SwitchVersion = ({ isMobile }: Props) => {
  const { chainId } = useActiveWeb3React()
  // Highlight the EFFECTIVE version (useVersion already falls back to a
  // chain-supported one), not the raw stored appVersion. Otherwise, switching
  // from a chain with V3 Pilot (v3) to one without it (e.g. HyperEVM = V2 +
  // V3 Official only) left the toggle with nothing selected while the pool
  // list correctly showed the fallback (V2).
  const { version, isDisabled, switchVersion } = useVersion({ chainId })

  // Build from the deployment tables: Bera has both V3s → V2 / V3 Official /
  // V3 Pilot; HyperEVM has official only → V2 / V3 Official.
  const options: Option[] = [
    { label: 'V2', version: 2 },
    ...(hasV3Official(chainId) ? [{ label: 'V3 Official', version: 4 }] : []),
    ...(hasV3Pilot(chainId) ? [{ label: 'V3 Pilot', version: 3 }] : []),
  ]

  const handleSelect = (v: number) => {
    if (isDisabled || v === version) return
    switchVersion(v)
    setTimeout(() => location.reload(), 200)
  }

  // Hide when V3 isn't available (production API doesn't have /indexer/v3).
  // Capability follows VITE_API_URL, not VITE_ENVIRONMENT.
  if (!isV3Enabled) return null
  if (isDisabled || options.length <= 1) return null

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
      {options.map((o) => (
        <button
          key={o.version}
          onClick={() => handleSelect(o.version)}
          className={`transition-colors ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            padding: '0 10px',
            height: '100%',
            borderRadius: '999px',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            color: version === o.version ? '#FFFFFF' : '#978A80',
            background: version === o.version ? '#985C2A' : 'transparent',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default SwitchVersion
