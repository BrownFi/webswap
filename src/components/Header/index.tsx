import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChainId } from '@brownfi/sdk'

import Logo from 'assets/svg/logo.svg'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { ChainModal } from './CustomChainSelect'
import { AccountModal } from './CustomAccountDisplay'
import { useSwitchChain } from 'wagmi'

const StyledConnectButton = () => {
  const [chainModalOpen, setChainModalOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const { switchChain } = useSwitchChain()

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#FFFFFF',
                      background: '#985C2A',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      height: '48px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    Connect wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <>
                    <button
                      onClick={() => setChainModalOpen(true)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full min-h-10 transition-all"
                    >
                      Wrong network
                    </button>
                    <ChainModal
                      isOpen={chainModalOpen}
                      onClose={() => setChainModalOpen(false)}
                      onSwitchChain={(chainId) => switchChain?.({ chainId })}
                    />
                  </>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChainModalOpen(true)}
                    className="flex items-center gap-2.5 bg-transparent border-none hover:opacity-80 transition-all py-3 px-4 h-12 cursor-pointer"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img src={chain.iconUrl} alt={chain.name ?? ''} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="text-white text-[16px] font-medium">{chain.name}</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setAccountModalOpen(true)}
                    className="flex items-center gap-2.5 bg-transparent border-none hover:opacity-80 transition-all py-3 px-4 h-12 cursor-pointer text-white text-[16px] font-medium"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {account.displayBalance && <span>{account.displayBalance}</span>}
                    <span>{account.displayName}</span>
                  </button>
                  <AccountModal
                    isOpen={accountModalOpen}
                    onClose={() => setAccountModalOpen(false)}
                  />
                  <ChainModal
                    isOpen={chainModalOpen}
                    onClose={() => setChainModalOpen(false)}
                    onSwitchChain={(chainId) => switchChain?.({ chainId })}
                  />
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
import { appEnvLabel, isMainnet } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { useAccount } from 'wagmi'
import CustomAccountDisplay from './CustomAccountDisplay'
import CustomChainSelect from './CustomChainSelect'
import HamburgerMenu from './HamburgerMenu'
import { isFeeClaimWallet } from '@clmm/config/fee-split'

function StyledNavLink({
  id,
  to,
  end,
  className,
  children,
}: {
  id: string
  to: string
  end?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <NavLink
      id={id}
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center justify-center cursor-pointer no-underline
        text-white text-[16px] font-medium py-2 px-6 rounded-md
        hover:text-[#D59967] transition-colors
        ${isActive || className?.includes('active') ? '!text-[#D59967]' : ''}
        ${className ?? ''}`
      }
      style={{ fontFamily: "'Inter', sans-serif", lineHeight: '24px' }}
    >
      {children}
    </NavLink>
  )
}

const HEMI_CHAIN_ID = 43111

// One navbar, item set follows the chain. On Hemi (CLMM-only) it's
// Swap / Pool / Analytics pointing at /clmm/*; on webswap chains it's Swap / Pool
// pointing at webswap routes. Switching networks via the chain selector flips the
// whole set — no greyed items, no CLMM dropdown, one consistent experience. Route
// is also checked so the navbar matches the page even while disconnected (chainId
// undefined) but sitting on a /clmm route.
function MainNav() {
  const { chainId, address } = useAccount()
  const location = useLocation()
  const showClmmNav = chainId === HEMI_CHAIN_ID || location.pathname.startsWith('/clamm')

  // Both the pool list (/clamm/pool) and detail (/clamm/pool/:pool) share the
  // /clamm/pool prefix, so key the highlight off that rather than NavLink's exact
  // match. Webswap's Pool spans add/remove/create/find too.
  const clmmPoolActive = location.pathname.startsWith('/clamm/pool')
  const webswapPoolActive = ['/pool', '/add', '/remove', '/create', '/find'].some((p) => location.pathname.startsWith(p))

  const clmmItems = [
    { id: 'swap-nav-link', to: '/clamm/swap', label: 'Swap', end: false, active: false },
    // Labeled "CLAMM" (the product) per Jason; links to the pool list.
    { id: 'pool-nav-link', to: '/clamm/pool', label: 'CLAMM', end: false, active: clmmPoolActive },
    { id: 'analytics-nav-link', to: '/clamm/analytics', label: 'Analytics', end: false, active: false },
  ]
  // Partner fee-claim entry — only the BrownFi/Hemi wallets (hardcoded, no on-chain
  // read) see it; the page itself still enforces every action on-chain.
  if (isFeeClaimWallet(address)) {
    clmmItems.push({
      id: 'claim-fee-nav-link',
      to: '/clamm/claim-fee',
      label: 'Claim Fees',
      end: false,
      active: location.pathname.startsWith('/clamm/claim-fee'),
    })
  }

  const items = showClmmNav
    ? clmmItems
    : [
        { id: 'swap-nav-link', to: '/swap', label: 'Swap', end: false, active: false },
        { id: 'pool-nav-link', to: '/pool', label: 'Pool', end: true, active: webswapPoolActive },
      ]

  return (
    <>
      {items.map((it) => (
        <StyledNavLink key={it.id} id={it.id} to={it.to} end={it.end} className={it.active ? 'active' : ''}>
          {it.label}
        </StyledNavLink>
      ))}
    </>
  )
}

export default function Header() {
  const { account } = useActiveWeb3React()
  const { isConnected, chainId } = useAccount()
  const showCustomAccountDisplay = !!account && !isConnected

  return (
    <div
      className="flex py-4 px-2  items-center justify-between w-full top-0 relative z-[2] "
      style={{  maxWidth: '1280px', margin: '0 auto' }}
    >
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6 max-md:gap-3">
        <Link to={chainId === ChainId.ROBINHOOD_MAINNET ? '/pool' : '/swap'} className="flex items-center shrink-0">
          <div className="transition-transform duration-300 hover:-rotate-[5deg]">
            <img className="min-w-[120px] w-[120px] lg:w-[142px] lg:min-w-[142px]" src={Logo} alt="logo" />
          </div>
        </Link>

        {!isMainnet && (
          <span style={{
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 600,
            color: '#FFFFFF',
            background: '#985C2A',
            borderRadius: '6px',
            padding: '2px 8px',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            {appEnvLabel}
          </span>
        )}

        <HamburgerMenu>
        <nav aria-label="Main navigation">
          <div
            className="flex items-center p-1 rounded-lg max-md:flex-col max-md:bg-transparent max-md:shadow-none max-md:backdrop-blur-none max-md:rounded-none"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
            }}
          >
            <MainNav />
            {/* Blog & Docs moved to the footer per UX feedback. Footer is
                always rendered (desktop + mobile) so we no longer surface them
                in the nav at all — avoids the duplicate on mobile. */}
          </div>
        </nav>
      </HamburgerMenu>
      </div>

      {/* Right: Chain + Connect */}
      <div
        className="flex items-center gap-4 shrink-0
        max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-[99]
        max-md:h-[72px] max-md:bg-[#050505] max-md:border-t max-md:border-[#2F2823]
        max-md:justify-center max-md:p-4"
      >
        <CustomChainSelect />
        {showCustomAccountDisplay ? <CustomAccountDisplay /> : <StyledConnectButton />}
      </div>
    </div>
  )
}
