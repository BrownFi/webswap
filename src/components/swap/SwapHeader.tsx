import styled from 'styled-components'
import { SettingsTab } from 'components/Settings'
import SwitchVersion from 'components/SwitchVersion'

const StyledSwapHeader = styled.div`
  padding: 0 0 24px 0;
  margin-bottom: -4px;
  width: 100%;
  max-width: 690px;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToMedium`
   padding: 0 0 20px 0
  `};
`

const StyledSwaptitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 36px;
  line-height: 44px;
  letter-spacing: -0.02em;
  background: linear-gradient(180deg, #F5E6DA 31.59%, #D08C55 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 24px;
    line-height: 32px;
  `};
`

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StyledSwaptitle>Swap Token</StyledSwaptitle>
        <div className="flex items-center gap-3">
          <SwitchVersion />
          <SettingsTab />
        </div>
      </div>
    </StyledSwapHeader>
  )
}
