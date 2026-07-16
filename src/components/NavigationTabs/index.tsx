import { NavLink, Link as HistoryLink } from 'react-router-dom'

import { ChevronLeft } from 'react-feather'
import { RowBetween } from 'components/Row'
import { SettingsTab } from 'components/Settings'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { resetMintState } from 'state/mint/actions'

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
        `flex flex-row flex-nowrap items-center justify-center h-12 rounded-[3rem] outline-none cursor-pointer no-underline text-text3 text-xl
        hover:text-text1 focus:text-text1
        ${isActive || className?.includes('active') ? 'rounded-lg font-medium !text-text1' : ''}
        ${className ?? ''}`
      }
    >
      {children}
    </NavLink>
  )
}

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  return (
    <div
      className="flex flex-row flex-nowrap items-center rounded-[3rem] justify-evenly"
      style={{ marginBottom: '20px', display: 'none' }}
    >
      <StyledNavLink id="swap-nav-link" to="/swap" end className={active === 'swap' ? 'active' : ''}>
        Swap
      </StyledNavLink>
      <StyledNavLink id="pool-nav-link" to="/pool" end className={active === 'pool' ? 'active' : ''}>
        Pool
      </StyledNavLink>
    </div>
  )
}

export function FindPoolTabs() {
  return (
    <div className="flex flex-row flex-nowrap items-center rounded-[3rem] justify-evenly">
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink to="/pool">
          <ChevronLeft className="text-text1 mr-3 w-6" color="white" />
        </HistoryLink>
        <div className="font-medium text-xl">Import Pool</div>
        <SettingsTab />
      </RowBetween>
    </div>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div>
      <RowBetween style={{ padding: '0', alignItems: 'center' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <HistoryLink
            to="/pool"
            onClick={() => {
              adding && dispatch(resetMintState())
            }}
          >
            <div style={{ width: '44px', height: '44px', background: '#2F2823', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={24} color="#B8ADA4" />
            </div>
          </HistoryLink>

          <span
            className="text-[24px] sm:text-[36px] leading-[32px] sm:leading-[44px]"
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#D8A072',
            }}
          >
            {creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}
          </span>
        </div>

        <SettingsTab />
      </RowBetween>
    </div>
  )
}
