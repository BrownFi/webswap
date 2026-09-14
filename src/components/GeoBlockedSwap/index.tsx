import logoWhite from 'assets/svg/logo_white.svg'

export default function GeoBlockedSwap() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        width: '100%',
        minHeight: '560px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
        padding: '48px 24px',
        textAlign: 'center',
        color: '#FBFBFD',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <img src={logoWhite} alt="BrownFi" style={{ width: '199px', height: '48px' }} />
      <p style={{ maxWidth: '620px', margin: 0, fontSize: '18px', lineHeight: 1.6 }}>
        Hi there! Unfortunately, BrownFi&apos;s Swap isn&apos;t available in your country right now. We appreciate your understanding.
      </p>
    </div>
  )
}
