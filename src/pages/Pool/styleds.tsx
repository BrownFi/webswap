import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { Text } from 'components/Rebass'
import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  padding: 0 24px 0 24px;
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
  background-color: #c4943a;
  border: 0;
  border-radius: 0;
  font-size: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  color: #0a0806;
  :hover {
    background-color: #d4a94f;
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
  max-width: 1280px;
  width: 100%;
  background: #1E1915;
  border: 1px solid #2F2823;
  border-radius: 32px;
`

export const TitleRow = styled(RowBetween)`
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 8px;
    width: 100%;
  `};
`

export const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  white-space: nowrap;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 8px 12px;
    font-size: 13px;
  `};
`

export const EmptyProposals = styled.div`
  padding: 16px 12px;
  border-radius: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const IndexerModalContent = styled(AutoColumn)`
  position: relative;
  width: 100%;
  padding: 24px;
  gap: 16px;
`
