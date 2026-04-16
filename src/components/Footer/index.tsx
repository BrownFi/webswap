import logoWhite from 'assets/svg/logo_white.svg'

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const YoutubeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const ThreadsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M12.186 24h-.007C5.461 23.994.015 18.544.009 11.812.003 5.291 5.203.072 11.715.003 11.81.002 11.907 0 12.003 0c3.1 0 5.983 1.2 8.124 3.38a11.7 11.7 0 013.376 8.116c.07 3.137-1.1 6.093-3.298 8.326A11.56 11.56 0 0112.186 24zm-.103-22.5c-.08 0-.16.001-.24.003C6.04 1.572 1.505 6.122 1.509 11.813c.005 5.895 4.77 10.685 10.674 10.687h.006a10.07 10.07 0 007.084-2.894 10.22 10.22 0 002.876-7.256 10.2 10.2 0 00-2.942-7.072A10.08 10.08 0 0012.003 1.5h-.003l.083-.001z"/>
  </svg>
)

const Footer = () => {
  return (
    <footer
      style={{
        background: '#050505',
        padding: '120px 80px 48px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '120px',
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
              { icon: <InstagramIcon />, href: '#' },
              { icon: <XIcon />, href: 'https://x.com/BrownFiAMM' },
              { icon: <FacebookIcon />, href: '#' },
              { icon: <YoutubeIcon />, href: '#' },
              { icon: <ThreadsIcon />, href: '#' },
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
