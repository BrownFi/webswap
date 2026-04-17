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
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: '4px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '100px',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 8px',
          width: '80px',
          height: '32px',
          borderRadius: '100px',
          background: enabled ? '#985C2A' : 'none',
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: '24px',
          color: enabled ? '#FFFFFF' : '#B8ADA4',
        }}
      >
        Zap
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 8px',
          width: '80px',
          height: '32px',
          borderRadius: '100px',
          background: !enabled ? '#985C2A' : 'none',
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: '24px',
          color: !enabled ? '#FFFFFF' : '#B8ADA4',
        }}
      >
        Classic
      </div>
    </div>
  )
}
