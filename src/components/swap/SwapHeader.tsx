import styled from 'styled-components'
import { SettingsTab } from 'components/Settings'
import { RowBetween } from 'components/Row'
import { Flex } from 'components/Rebass'
import SwitchVersion from 'components/SwitchVersion'

const StyledSwapHeader = styled.div`
  padding: 24px 24px 24px 24px;
  margin-bottom: -4px;
  width: 100%;
  max-width: 500px;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToMedium`
   padding: 20px
  `};
`

const StyledSwaptitle = styled.p`
  font-size: 30px;
  font-weight: 800;
  color: #F5F0E8;
  font-family: 'Montserrat', sans-serif;
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
        <SettingsTab />
      </RowBetween>
    </StyledSwapHeader>
  )
}
