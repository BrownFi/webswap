import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { Text } from 'rebass'
import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  padding: 0 32px 0 32px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 0 20px 0 20px;
 `};
`

export const ClickableText = styled(Text)`
  :hover {
    cursor: pointer;
  }
  color: ${({ theme }) => theme.primary1};
`
export const MaxButton = styled.button<{ width: string }>`
  padding: 0.5rem 1rem;
  background-color: #27e3ab;
  border: 0;
  border-radius: 0;
  font-size: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  color: #1e1e1e;
  :hover {
    background-color: #27f3ab;
  }
  :focus {
    outline: none;
  }
`

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

// Pool page

export const PageWrapper = styled(AutoColumn)`
  max-width: 894px;
  width: 100%;
  background-color: #1d1c21;
`

export const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

export const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

export const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const IndexerBanner = styled.div`
  max-width: 894px;
  width: 100%;
  top: 90px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #bb9981;
  background: rgba(187, 153, 129, 0.18);
  color: #f2dfc8;
  margin: 0 auto 16px;
  position: fixed;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    position: static;
  `};
`

export const CloseBannerButton = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;

  &:hover {
    opacity: 0.85;
  }

  &:focus {
    outline: 2px solid rgba(242, 223, 200, 0.4);
    outline-offset: 2px;
  }
`
