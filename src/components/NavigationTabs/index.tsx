import styled from 'styled-components'
import { darken } from 'polished'
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

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const StyledNavLink = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.active {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`

const StyledArrowLeft = styled(ChevronLeft)`
  color: ${({ theme }) => theme.text1};
  margin-right: 12px;
  width: 24px;
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation()
  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} end className={active === 'swap' ? 'active' : ''}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} end className={active === 'pool' ? 'active' : ''}>
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft color="white" />
        </HistoryLink>
        <ActiveText>Import Pool</ActiveText>
        <SettingsTab />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  const dispatch = useDispatch<AppDispatch>()

  return (
    <Tabs>
      <RowBetween style={{ padding: isMobile ? '20px 20px 10px 20px' : '32px 32px 10px 32px' }}>
        <div className="flex items-center">
          <HistoryLink
            to="/pool"
            onClick={() => {
              adding && dispatch(resetMintState())
            }}
          >
            <StyledArrowLeft color="white" />
          </HistoryLink>

          <Flex alignItems="center" className="gap-6">
            <ActiveText className="text-white !text-[24px]" style={{ fontFamily: 'Russo One' }}>
              {creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}
            </ActiveText>
            <SwitchVersion />
          </Flex>
        </div>

        <SettingsTab />
      </RowBetween>
    </Tabs>
  )
}
