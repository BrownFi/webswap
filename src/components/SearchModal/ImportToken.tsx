import { useState } from 'react'
import { Token, Currency } from '@brownfi/sdk'
import styled from 'styled-components'
import { TYPE, CloseIcon } from 'theme'
import { Card } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { CurrencyLogo } from 'components/CurrencyLogo'
import { ArrowLeft, AlertTriangle } from 'react-feather'
import useTheme from 'hooks/useTheme'
import { ButtonPrimary } from 'components/Button'
import { useAddUserToken } from 'state/user/hooks'
import { getEtherscanLink } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { ExternalLink } from 'theme/components'
import { useCombinedInactiveList } from 'state/lists/hooks'
import ListLogo from 'components/ListLogo'
import { PaddedColumn } from './styleds'

// BrownFi red. Slightly muted vs the default theme `red1` so it sits cleanly
// against the dark/brown surface without screaming.
const BRAND_RED = '#FF3B6A'
const BRAND_YELLOW = '#D8A072'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: auto;
`

// Inline "Unknown Source" pill — thin red border + dark surface, matching
// the rest of the dark UI rather than the old red-tinted fill.
const UnknownSourceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 59, 106, 0.35);
  background: rgba(255, 59, 106, 0.08);
  color: ${BRAND_RED};
  font-size: 11px;
  font-weight: 500;
`

// Soft-warning wrapper for the "Trade at your own risk" panel. Dark surface
// with a tinted border, body text in white/gray for readability. Only the
// title + small icon carry the red emphasis.
const WarningPanel = styled.div<{ $severe: boolean }>`
  background: #1e1915;
  border: 1px solid ${({ $severe }) => ($severe ? 'rgba(255, 59, 106, 0.35)' : 'rgba(216, 160, 114, 0.35)')};
  border-radius: 12px;
  padding: 20px;
`

// Copper-tinted checkbox so the agreement step matches the BrownFi accent.
const BrandCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #985c2a;
  cursor: pointer;
  margin: 0;
`

const AddressText = styled(TYPE.blue)`
  font-size: 12px;
  color: ${BRAND_YELLOW};
  word-break: break-all;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`

interface ImportProps {
  tokens: Token[]
  onBack?: () => void
  onDismiss?: () => void
  handleCurrencySelect?: (currency: Currency) => void
}

export function ImportToken({ tokens, onBack, onDismiss, handleCurrencySelect }: ImportProps) {
  const theme = useTheme()

  const { chainId } = useActiveWeb3React()

  const [confirmed, setConfirmed] = useState(false)

  const addToken = useAddUserToken()

  // use for showing import source on inactive tokens
  const inactiveTokenList = useCombinedInactiveList()

  // higher warning severity if either is not on a list
  const fromLists =
    (chainId && inactiveTokenList?.[chainId]?.[tokens[0]?.address]?.list) ||
    (chainId && inactiveTokenList?.[chainId]?.[tokens[1]?.address]?.list)

  return (
    <Wrapper>
      <PaddedColumn gap="14px" style={{ width: '100%', flex: '1 1' }}>
        <RowBetween>
          {onBack ? <ArrowLeft style={{ cursor: 'pointer' }} onClick={onBack} color="white" /> : <div></div>}
          <TYPE.mediumHeader color={'white'} fontWeight={'bold'}>
            Import {tokens.length > 1 ? 'Tokens' : 'Token'}
          </TYPE.mediumHeader>
          {onDismiss ? <CloseIcon onClick={onDismiss} color="white" /> : <div></div>}
        </RowBetween>
      </PaddedColumn>
      {/* <SectionBreak /> */}
      <PaddedColumn gap="md">
        {tokens.map((token) => {
          const list = chainId && inactiveTokenList?.[chainId]?.[token.address]?.list
          return (
            <Card backgroundColor={'#251f16'} key={'import' + token.address} className=".token-warning-container">
              <AutoColumn gap="10px">
                <AutoRow align="center">
                  <CurrencyLogo currency={token} size={'24px'} />
                  <TYPE.body ml="8px" mr="8px" fontWeight={500} fontSize="16px" color="white">
                    {token.symbol}
                  </TYPE.body>
                  <TYPE.darkGray fontWeight={500} fontSize={'12px'} color={'white'} opacity={0.5}>
                    {token.name}
                  </TYPE.darkGray>
                </AutoRow>
                {chainId && (
                  <ExternalLink href={getEtherscanLink(chainId, token.address, 'address')}>
                    <AddressText>{token.address}</AddressText>
                  </ExternalLink>
                )}
                {list !== undefined ? (
                  <RowFixed>
                    {list.logoURI && <ListLogo logoURI={list.logoURI} size="12px" />}
                    <TYPE.small ml="6px" color={theme.text3}>
                      via {list.name}
                    </TYPE.small>
                  </RowFixed>
                ) : (
                  <UnknownSourceBadge>
                    <AlertTriangle stroke={BRAND_RED} size={11} />
                    Unknown Source
                  </UnknownSourceBadge>
                )}
              </AutoColumn>
            </Card>
          )
        })}

        <WarningPanel $severe={!fromLists}>
          <AutoColumn justify="center" style={{ textAlign: 'center', gap: '12px', marginBottom: '16px' }}>
            <AlertTriangle stroke={fromLists ? BRAND_YELLOW : BRAND_RED} size={28} />
            <TYPE.body fontWeight={600} fontSize={18} color={fromLists ? BRAND_YELLOW : BRAND_RED}>
              Trade at your own risk!
            </TYPE.body>
          </AutoColumn>

          <AutoColumn style={{ textAlign: 'center', gap: '12px', marginBottom: '16px' }}>
            <TYPE.body fontWeight={400} fontSize={13} color={'#CFC7C1'}>
              Anyone can create a token, including creating fake versions of existing tokens that claim to represent
              projects.
            </TYPE.body>
            <TYPE.body fontWeight={600} fontSize={13} color={'#FBFBFD'}>
              If you purchase this token, you may not be able to sell it back.
            </TYPE.body>
          </AutoColumn>

          <AutoRow justify="center" style={{ cursor: 'pointer', gap: '10px' }} onClick={() => setConfirmed(!confirmed)}>
            <BrandCheckbox
              className=".understand-checkbox"
              name="confirmed"
              type="checkbox"
              checked={confirmed}
              onChange={() => setConfirmed(!confirmed)}
            />
            <TYPE.body fontSize="14px" color={'#FBFBFD'} fontWeight={500}>
              I understand
            </TYPE.body>
          </AutoRow>
        </WarningPanel>
        <ButtonPrimary
          disabled={!confirmed}
          altDisabledStyle={true}
          borderRadius="20px"
          padding="10px 1rem"
          onClick={() => {
            tokens.map((token) => addToken(token))
            handleCurrencySelect && handleCurrencySelect(tokens[0])
          }}
          className=".token-dismiss-button"
        >
          Import
        </ButtonPrimary>
      </PaddedColumn>
    </Wrapper>
  )
}
