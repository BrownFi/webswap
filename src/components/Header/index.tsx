import { Link, NavLink, useLocation } from 'react-router-dom'

import Logo from 'assets/svg/logo.svg'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { chainSelector } from 'state/chainSlice'
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

// webswap's product pages (Swap/Pool/Portfolio) don't run on Hemi — Hemi is
// CLMM-only. Grey these out on Hemi (symmetric to CLMM being greyed off-Hemi);
// clicking switches the wallet back to the last webswap chain.
function WebswapNavItem({
  id,
  to,
  end,
  active,
  children,
}: {
  id: string
  to: string
  end?: boolean
  active?: boolean
  children: React.ReactNode
}) {
  const { chainId } = useAccount()
  const lastChain = useSelector(chainSelector)
  const onHemi = chainId === HEMI_CHAIN_ID

  if (onHemi) {
    return (
      <span
        id={id}
        aria-disabled="true"
        title={lastChain?.name ? `Available on ${lastChain.name} — switch network to use this` : 'Switch network to use this'}
        className="flex items-center justify-center select-none no-underline text-[16px] font-medium py-2 px-6 rounded-md"
        style={{ fontFamily: "'Inter', sans-serif", lineHeight: '24px', color: '#FFFFFF', opacity: 0.3, cursor: 'not-allowed' }}
      >
        {children}
      </span>
    )
  }
  return (
    <StyledNavLink id={id} to={to} end={end} className={active ? 'active' : ''}>
      {children}
    </StyledNavLink>
  )
}

// CLMM lives on Hemi only. On Hemi it's a dropdown (CLMM Swap / CLMM Pool) in the
// main navbar; off Hemi it's greyed and clicking switches the network there.
function ClmmNavItem() {
  const { chainId } = useAccount()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const onHemi = chainId === HEMI_CHAIN_ID
  const isActive = location.pathname.startsWith('/clmm')

  if (!onHemi) {
    return (
      <span
        id="clmm-nav-link"
        aria-disabled="true"
        title="Available on Hemi — switch network to use CLMM"
        className="flex items-center justify-center select-none no-underline text-[16px] font-medium py-2 px-6 rounded-md"
        style={{ fontFamily: "'Inter', sans-serif", lineHeight: '24px', color: '#FFFFFF', opacity: 0.3, cursor: 'not-allowed' }}
      >
        CLMM
      </span>
    )
  }

  const itemCls = ({ isActive: active }: { isActive: boolean }) =>
    `block w-full text-left px-4 py-2.5 text-[15px] font-medium no-underline whitespace-nowrap
     transition-colors ${active ? 'text-[#D59967]' : 'text-white hover:text-[#D59967]'}`

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        id="clmm-nav-link"
        type="button"
        className={`flex items-center gap-1 cursor-pointer bg-transparent border-none py-2 px-6 rounded-md
          text-[16px] font-medium transition-colors ${isActive ? '!text-[#D59967]' : 'text-white hover:text-[#D59967]'}`}
        style={{ fontFamily: "'Inter', sans-serif", lineHeight: '24px' }}
      >
        CLMM
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-[120]"
          style={{ minWidth: '160px' }}
        >
          <div style={{ background: '#1E1915', border: '1px solid #2F2823', borderRadius: '12px', overflow: 'hidden', padding: '4px' }}>
            <NavLink to="/clmm/swap" onClick={() => setOpen(false)} className={itemCls} style={{ fontFamily: "'Inter', sans-serif" }}>
              CLMM Swap
            </NavLink>
            <NavLink to="/clmm/pools" onClick={() => setOpen(false)} className={itemCls} style={{ fontFamily: "'Inter', sans-serif" }}>
              CLMM Pool
            </NavLink>
          </div>
        </div>
      )}
    </div>
  )
}

export const StyledMenuButton = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`relative w-full border-none bg-bg3 ml-2 py-[0.15rem] px-2 rounded-md
      h-[35px] hover:cursor-pointer hover:bg-bg4 focus:cursor-pointer focus:outline-none focus:bg-bg4
      [&>*]:stroke-text1 [&_svg]:mt-0.5 ${className ?? ''}`}
    {...props}
  >
    {children}
  </button>
)

export default function Header() {
  const { account } = useActiveWeb3React()
  const { isConnected } = useAccount()
  const showCustomAccountDisplay = !!account && !isConnected
  const location = useLocation()
  const isPoolActive = ['/pool', '/add', '/remove', '/create', '/find'].some((p) => location.pathname.startsWith(p))

  return (
    <div
      className="flex py-4 px-2  items-center justify-between w-full top-0 relative z-[2] "
      style={{  maxWidth: '1280px', margin: '0 auto' }}
    >
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6 max-md:gap-3">
        <Link to="/swap" className="flex items-center shrink-0">
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
            <WebswapNavItem id="swap-nav-link" to="/swap">
              Swap
            </WebswapNavItem>
            <WebswapNavItem id="pool-nav-link" to="/pool" end active={isPoolActive}>
              Pool
            </WebswapNavItem>
            {/* Portfolio temporarily hidden on beta — re-enable by uncommenting
                this link AND the lazy import + /portfolio route in App.tsx.
            <WebswapNavItem id="portfolio-nav-link" to="/portfolio">
              Portfolio
            </WebswapNavItem>
            */}
            <ClmmNavItem />
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
