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
        background: 'rgba(0, 0, 0, 0.06)',
        boxShadow: 'inset 0px 10px 14px rgba(237, 210, 188, 0.05), inset 0px 2px 16px rgba(236, 208, 186, 0.3)',
        backdropFilter: 'blur(12px)',
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
          background: enabled ? 'linear-gradient(105.56deg, #734117 1.68%, #D8A072 50%, #734017 98.32%)' : 'none',
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
          background: !enabled ? 'linear-gradient(105.56deg, #734117 1.68%, #D8A072 50%, #734017 98.32%)' : 'none',
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
