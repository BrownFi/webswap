import logoWhite from 'assets/svg/logo_white.svg'

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const TelegramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const ParagraphIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 4v16"/>
    <path d="M17 4v16"/>
    <path d="M13 4h4a4 4 0 010 8h-4"/>
    <path d="M9 4h4"/>
  </svg>
)

const Footer = () => {
  return (
    <footer
      className="px-4 pt-12 pb-8 sm:px-10 sm:pt-20 md:px-20 md:pt-[120px] md:pb-12"
      style={{
        background: '#050505',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '60px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Main content */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: '1760px',
          gap: '60px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Company description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '433px', flex: '1 1 300px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <img src={logoWhite} alt="BrownFi" style={{ width: '132px', height: '32px' }} />
            <p style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '160%', color: '#A1A1A1', margin: 0 }}>
              Trade beyond limits and unlock new opportunities as we redefine how the world invests, transacts, and grows in the crypto economy.
            </p>
          </div>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { icon: <XIcon />, href: 'https://x.com/BrownFiAMM' },
              { icon: <TelegramIcon />, href: 'https://t.me/brownfiammcommunity' },
              { icon: <ParagraphIcon />, href: 'https://paragraph.com/@brownfi-amm' },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '100px',
                  border: '1px solid #A1A1A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right: Footer links */}
        <div style={{ display: 'flex', gap: '57px', flexWrap: 'wrap' }}>
          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
            <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 500, fontSize: '18px', lineHeight: '23px', color: '#FFFFFF' }}>Navigation</span>
            {['Why choose us', 'Features', 'Supported Chains', 'Pricing', 'FAQ'].map((item) => (
              <a key={item} href="#" style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '21px', color: '#A1A1A1', textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
          {/* Support */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
            <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 500, fontSize: '18px', lineHeight: '23px', color: '#FFFFFF' }}>Support</span>
            {['Resources', 'Career', 'Blog', 'Member'].map((item) => (
              <a key={item} href="#" style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '21px', color: '#A1A1A1', textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
          {/* Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
            <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 500, fontSize: '18px', lineHeight: '23px', color: '#FFFFFF' }}>Contact</span>
            <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '200%', color: '#A1A1A1' }}>42 Quantum Avenue,{'\n'}San Francisco, CA</span>
            <a href="mailto:hello@credium.com" style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '21px', color: '#A1A1A1', textDecoration: 'none' }}>hello@credium.com</a>
            <a href="tel:+15552346678" style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '21px', color: '#A1A1A1', textDecoration: 'none' }}>+1 (555) 234-6678</a>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div style={{ width: '100%', maxWidth: '1760px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ width: '100%', height: '1px', background: '#2F2823' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '21px', color: '#A1A1A1' }}>
            &copy;{new Date().getUTCFullYear()} BrownFi. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '48px' }}>
            <a href="#" style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '21px', color: '#AAAAAA', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ fontFamily: 'Geist, Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '21px', color: '#AAAAAA', textDecoration: 'none' }}>Term of Use</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
