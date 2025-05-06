import React from 'react'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'

import styled from 'styled-components'

import Logo from '../../assets/svg/logo.svg'

import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import HamburgerMenu from './HamburgerMenu'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 20px 44px;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
`};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 44px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.menuText};
  font-size: 20px;
  width: fit-content;
  margin-right: 16px;
  font-weight: 400;
  padding: 8px 16px;
  font-family: 'Russo One', sans-serif;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.greenMain};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.greenMain)};
  }
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

export default function Header() {
  return (
    <HeaderFrame>
      <HeaderRow>
        <Title href="." className="mr-[44px]">
          <UniIcon>
            <img className="min-w-[142px] w-[142px]" src={Logo} alt="logo" />
          </UniIcon>
        </Title>

        <HamburgerMenu>
          <HeaderLinks>
            <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
              Swap
            </StyledNavLink>
            <StyledNavLink
              id={`pool-nav-link`}
              to={'/pool'}
              isActive={(match, { pathname }) =>
                Boolean(match) ||
                pathname.startsWith('/add') ||
                pathname.startsWith('/remove') ||
                pathname.startsWith('/create') ||
                pathname.startsWith('/find')
              }
            >
              Pool
            </StyledNavLink>
            <StyledNavLink id={`leaderboard-nav-link`} to={'/campaign/contest-1'}>
              Campaign
            </StyledNavLink>
          </HeaderLinks>
        </HamburgerMenu>
      </HeaderRow>

      <HeaderControls>
        <ConnectButton />

        {/* Legacy */}
        <Web3Status />
      </HeaderControls>
    </HeaderFrame>
  )
}
