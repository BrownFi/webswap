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
                    className="border border-[#c4943a80] bg-transparent text-[#F5F0E8] hover:border-[#c4943a] hover:bg-[#c4943a15] font-medium px-5 py-2 rounded-full min-h-10 transition-all text-sm"
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
                    className="flex items-center gap-1.5 border border-[#c4943a60] hover:border-[#c4943a] bg-transparent hover:bg-[#c4943a15] transition-all py-2 px-4 min-h-10 rounded-full"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img src={chain.iconUrl} alt={chain.name ?? ''} className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-[#F5F0E8] text-sm">{chain.name}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-0.5">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="#c4943a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setAccountModalOpen(true)}
                    className="flex items-center gap-1.5 border border-[#c4943a60] hover:border-[#c4943a] bg-transparent hover:bg-[#c4943a15] transition-all py-2 px-4 min-h-10 rounded-full text-[#F5F0E8] text-sm"
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
        `flex items-center cursor-pointer no-underline
        text-[#8A7D66] text-sm font-medium py-2 px-4
        hover:text-[#F5F0E8] transition-colors
        ${isActive || className?.includes('active') ? 'font-semibold !text-[#F5F0E8]' : ''}
        ${className ?? ''}`
      }
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
      className="flex items-center justify-between w-full top-0 relative py-4 px-6 lg:px-11 z-[2]
      max-md:px-4
      max-xs:py-2 max-xs:px-4"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-4 shrink-0">
        <Link to="/" className="flex items-center">
          <div className="transition-transform duration-300 hover:-rotate-[5deg]">
            <img className="min-w-[120px] w-[120px] lg:w-[142px] lg:min-w-[142px]" src={Logo} alt="logo" />
          </div>
        </Link>

        <SwitchVersion isMobile />

        {!isMainnet && (
          <ButtonSecondary className="!w-fit !bg-blue-500/40 !px-1 uppercase !text-xs">
            {appEnv}
          </ButtonSecondary>
        )}
      </div>

      {/* Center: Nav capsule */}
      <HamburgerMenu>
        <nav aria-label="Main navigation">
          <div className="flex items-center bg-[#1a1510]/60 border border-[#c4943a20] rounded-full px-1 py-0.5 backdrop-blur-sm max-md:flex-col max-md:bg-transparent max-md:border-none max-md:rounded-none">
            <StyledNavLink id="home-nav-link" to="/" end>
              Home
            </StyledNavLink>
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
            <StyledNavLink id="faq-nav-link" to="/faq">
              FAQ
            </StyledNavLink>
          </div>
        </nav>
      </HamburgerMenu>

      {/* Right: Chain + Connect */}
      <div
        className="flex items-center gap-2 shrink-0
        max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-[99]
        max-md:h-[72px] max-md:bg-[#0a0806] max-md:border-t max-md:border-[#c4943a20]
        max-md:justify-center max-md:p-4"
      >
        <CustomChainSelect />
        {showCustomAccountDisplay ? <CustomAccountDisplay /> : <StyledConnectButton />}
      </div>
    </div>
  )
}
