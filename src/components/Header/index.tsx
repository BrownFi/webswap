import { Link, NavLink, useLocation } from 'react-router-dom'

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
                      background: 'linear-gradient(#050505, #050505) padding-box, linear-gradient(180deg, #6B5B4E 0%, #C47736 100%) border-box',
                      border: '2px solid transparent',
                      boxShadow: 'inset 0px 8px 24px rgba(239, 190, 54, 0.25)',
                      borderRadius: '12px',
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
import { ButtonSecondary } from 'components/Button'
import Row, { RowFixed } from 'components/Row'
import SwitchVersion from 'components/SwitchVersion'
import { appEnv, isMainnet } from 'connectors'
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
        text-white text-[16px] font-medium py-2 px-6 rounded-lg
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

export const StyledMenuButton = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`relative w-full border-none bg-bg3 ml-2 py-[0.15rem] px-2 rounded-lg
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
        <Link to="/" className="flex items-center shrink-0">
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
            {appEnv}
          </span>
        )}

        <SwitchVersion isMobile />

        <HamburgerMenu>
        <nav aria-label="Main navigation">
          <div
            className="flex items-center p-1 rounded-xl max-md:flex-col max-md:bg-transparent max-md:shadow-none max-md:backdrop-blur-none max-md:rounded-none"
            style={{
              background: 'rgba(0, 0, 0, 0.06)',
              boxShadow: 'inset 0px 10px 14px rgba(237, 210, 188, 0.05), inset 0px 2px 16px rgba(236, 208, 186, 0.3)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
            }}
          >
            {!isMainnet && (
              <StyledNavLink id="swap-nav-link" to="/swap">
                Swap
              </StyledNavLink>
            )}
            <StyledNavLink id="pool-nav-link" to="/pool" end className={isPoolActive ? 'active' : ''}>
              Pool
            </StyledNavLink>
            <StyledNavLink id="leaderboard-nav-link" to="/campaign/contest-1">
              Campaign
            </StyledNavLink>
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
