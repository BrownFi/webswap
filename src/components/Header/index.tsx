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
                    className="bg-[#27E3AB] hover:bg-[#20c899] text-black font-semibold px-2.5 py-1 rounded-none min-h-10 transition-all hover:scale-105 text-sm"
                  >
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <>
                    <button
                      onClick={() => setChainModalOpen(true)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-none min-h-10 transition-all"
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
                    className="flex items-center gap-1.5 bg-black/40 hover:scale-105 transition-all py-1 px-2.5 min-h-10"
                    style={{ border: '1px solid #FFFFFF20' }}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img src={chain.iconUrl} alt={chain.name ?? ''} className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-white text-sm">{chain.name}</span>
                  </button>
                  <button
                    onClick={() => setAccountModalOpen(true)}
                    className="flex items-center gap-1.5 bg-black/40 hover:scale-105 transition-all py-1 px-2.5 min-h-10 text-white text-sm"
                    style={{ border: '1px solid #FFFFFF20' }}
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
        `flex flex-row flex-nowrap items-start rounded-[3rem] outline-none cursor-pointer no-underline
        text-menuText text-xl w-fit mr-4 font-normal py-2 px-4
        hover:text-[#20c899] focus:text-[#20c899]
        ${isActive || className?.includes('active') ? 'rounded-xl font-semibold !text-greenMain' : ''}
        ${className ?? ''}`
      }
      style={{ fontFamily: "'Russo One', sans-serif" }}
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
      className="grid grid-cols-2 items-center justify-between flex-row w-full top-0 relative py-5 px-11 z-[2]
      max-md:grid-cols-1 max-md:px-4 max-md:relative
      max-xs:py-2 max-xs:px-4"
    >
      {/* HeaderRow */}
      <RowFixed className="max-md:w-full">
        {/* Title */}
        <div className="flex items-center pointer-events-auto justify-self-start gap-4 max-sm:justify-self-center hover:cursor-pointer mr-[40px] relative">
          <Link to="/">
            {/* UniIcon */}
            <div className="transition-transform duration-300 hover:-rotate-[5deg]">
              <img className="min-w-[142px] w-[142px]" src={Logo} alt="logo" />
            </div>
          </Link>

          <SwitchVersion isMobile />

          {!isMainnet && (
            <ButtonSecondary className="!w-fit !bg-blue-500/40 !px-1 uppercase !absolute -bottom-6 left-20">
              {appEnv}
            </ButtonSecondary>
          )}
        </div>

        <HamburgerMenu>
          <nav aria-label="Main navigation">
            {/* HeaderLinks */}
            <Row className="justify-center max-md:flex-col">
              <StyledNavLink id="swap-nav-link" to="/swap">
                Swap
              </StyledNavLink>
              <StyledNavLink id="pool-nav-link" to="/pool" end className={isPoolActive ? 'active' : ''}>
                Pool
              </StyledNavLink>
              <StyledNavLink id="leaderboard-nav-link" to="/campaign/contest-1">
                Campaign
              </StyledNavLink>
            </Row>
          </nav>
        </HamburgerMenu>
      </RowFixed>

      {/* HeaderControls */}
      <div
        className="flex flex-row items-center justify-self-end gap-2
        max-md:justify-between max-md:justify-self-center max-md:w-full max-md:max-w-[960px]
        max-md:p-4 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:z-[99]
        max-md:h-[72px] max-md:bg-[#0D0D0F] max-md:border-t max-md:border-[#FFFFFF15]"
      >
        <CustomChainSelect />
        {showCustomAccountDisplay ? <CustomAccountDisplay /> : <StyledConnectButton />}
      </div>
    </div>
  )
}
