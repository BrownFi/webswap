import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink } from 'react-router-dom'

import { ChevronLeft } from 'react-feather'
import { RowBetween } from 'components/Row'
import { SettingsTab } from 'components/Settings'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { resetMintState } from 'state/mint/actions'
import { isMobile } from 'react-device-detect'
import { Flex } from 'rebass'
import SwitchVersion from 'components/SwitchVersion'

function StyledNavLink({ id, to, end, className, children }: {
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
        ${isActive || className?.includes('active') ? 'rounded-xl font-medium !text-text1' : ''}
        ${className ?? ''}`
      }
    >
      {children}
    </NavLink>
  )
}

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation()
  return (
    <div
      className="flex flex-row flex-nowrap items-center rounded-[3rem] justify-evenly"
      style={{ marginBottom: '20px', display: 'none' }}
    >
      <StyledNavLink id="swap-nav-link" to="/swap" end className={active === 'swap' ? 'active' : ''}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id="pool-nav-link" to="/pool" end className={active === 'pool' ? 'active' : ''}>
        {t('pool')}
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
    <div className="flex flex-row flex-nowrap items-center rounded-[3rem] justify-evenly">
      <RowBetween style={{ padding: isMobile ? '20px 20px 10px 20px' : '32px 32px 10px 32px' }}>
        <div className="flex items-center">
          <HistoryLink
            to="/pool"
            onClick={() => {
              adding && dispatch(resetMintState())
            }}
          >
            <ChevronLeft className="text-text1 mr-3 w-6" color="white" />
          </HistoryLink>

          <Flex alignItems="center" className="gap-6">
            <div className="font-medium text-xl text-white !text-[24px]" style={{ fontFamily: 'Russo One' }}>
              {creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}
            </div>
            <SwitchVersion />
          </Flex>
        </div>

        <SettingsTab />
      </RowBetween>
    </div>
  )
}
