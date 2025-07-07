import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { RowBetween } from '../Row'
import { Flex } from 'rebass'
import SwitchVersion from 'components/SwitchVersion'

const StyledSwapHeader = styled.div`
  padding: 32px 24px 28px 32px;
  margin-bottom: -4px;
  width: 100%;
  max-width: 500px;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToMedium`
   padding: 20px
  `};
`

const StyledSwaptitle = styled.p`
  font-size: 24px;
  color: white;
  font-family: 'Russo One', sans-serif;
  flex: 1;
`

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <Flex alignItems="center" className="gap-6">
          <StyledSwaptitle>Swap Token</StyledSwaptitle>
          <SwitchVersion />
        </Flex>
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}
