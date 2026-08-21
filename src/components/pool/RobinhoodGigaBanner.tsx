type Props = {
  className?: string
}

export function RobinhoodGigaBanner({ className = '' }: Props) {
  return (
    <div
      className={`relative overflow-hidden flex items-center gap-4 p-4 sm:p-5 ${className}`}
      style={{
        background: '#120F0D',
        border: '1px solid #493E35',
        borderRadius: '12px',
        boxShadow: 'inset 3px 0 0 #D8A072',
      }}
    >
      <div className="min-w-0" style={{ flex: 1 }}>
        <div
          className="text-[15px] sm:text-[16px]"
          style={{ fontFamily: 'Inter', fontWeight: 600, lineHeight: '22px', color: '#FBFBFD' }}
        >
          Extra rewards for Robinhood liquidity
        </div>
        <p className="m-0 text-[12px] sm:text-[13px]" style={{ fontFamily: 'Inter', lineHeight: '19px', color: '#978A80' }}>
          BrownFi is partnering with GIGA DEX with extra bonus on Robinhood. You should manage liquidity & claim $GIGA token rewards on their UI
        </p>
      </div>
      <a
        href="https://www.gigadex.fi/pools"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center shrink-0 whitespace-nowrap no-underline"
        style={{ width: '60px', height: '60px' }}
        title="Provide liquidity on Giga Dex"
      >
        <img src="https://www.gigadex.fi/giga-icon.png" alt="Giga Dex" style={{ width: '56px', height: '56px', borderRadius: '12px' }} />
      </a>
    </div>
  )
}
