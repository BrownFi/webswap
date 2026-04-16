import { ChainId, Currency } from '@brownfi/sdk'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Modal } from 'components/Modal'
import { ExternalLink } from 'theme'
import { Text } from 'components/Rebass'
import { CloseIcon, CustomLightSpinner } from 'theme/components'
import { RowBetween, RowFixed } from 'components/Row'
import { CheckCircle } from 'react-feather'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn, ColumnCenter } from 'components/Column'
import Circle from 'assets/images/blue-loader.svg'
import MetaMaskLogo from 'assets/images/metamask.png'
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { useActiveWeb3React } from 'hooks'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import checkCircle from 'assets/svg/check_circle.svg'
import cancel from 'assets/svg/cancel.svg'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 32px 40px;
`

const BottomSection = styled(Section)`
  padding-top: 0
  // background-color: ${({ theme }) => theme.bg2};
  // border-bottom-left-radius: 20px;
  // border-bottom-right-radius: 20px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  return (
    <Wrapper className="relative">
      <Section>
        <RowBetween>
          <div />
          <span className="absolute top-[16px] right-[16px]">
            <CloseIcon color="#B8ADA4" onClick={onDismiss} />
          </span>
        </RowBetween>
        <ConfirmedIcon>
          <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '28px', lineHeight: '36px', color: '#FBFBFD', textAlign: 'center' }}>
            Waiting For Confirmation
          </span>
          <AutoColumn gap="12px" justify={'center'}>
            <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#CFC7C1', textAlign: 'center' }}>
              {pendingText}
            </span>
          </AutoColumn>
          <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#978A80', textAlign: 'center' }}>
            Confirm this transaction in your wallet
          </span>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const theme = useContext(ThemeContext)

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <Wrapper className="relative">
      <Section>
        <RowBetween>
          <div />
          <span className="absolute top-[16px] right-[16px]">
            <CloseIcon color="#B8ADA4" onClick={onDismiss} />
          </span>
        </RowBetween>
        <ConfirmedIcon className="!pb-[20px] !pt-[40px]">
          <img src={checkCircle} className="w-[100px]" alt="check" />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '28px', lineHeight: '36px', color: '#83CF84', textAlign: 'center' }}>
            Transaction Submitted
          </span>
          {chainId && hash && (
            <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>
              <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#83CF84' }}>
                View on {getScanText(chainId)}
              </span>
            </ExternalLink>
          )}
          {currencyToAdd && window?.ethereum?.isMetaMask && (
            <ButtonPrimary padding="6px 12px" width="100%" style={{ marginTop: '12px' }} onClick={addToken}>
              {!success ? (
                <RowFixed>
                  Add {getTokenSymbol(currencyToAdd, chainId)} to Metamask <StyledLogo src={MetaMaskLogo} />
                </RowFixed>
              ) : (
                <RowFixed>
                  Added {getTokenSymbol(currencyToAdd, chainId)}{' '}
                  <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                </RowFixed>
              )}
            </ButtonPrimary>
          )}
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper className="relative">
      <Section>
        <RowBetween>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '24px', lineHeight: '32px', color: '#FBFBFD' }}>
            {title}
          </span>
          <span className="absolute top-[16px] right-[16px]">
            <CloseIcon color="#B8ADA4" onClick={onDismiss} />
          </span>
        </RowBetween>
        {topContent()}
      </Section>
      <BottomSection gap="12px">{bottomContent()}</BottomSection>
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useContext(ThemeContext)
  return (
    <Wrapper className="relative">
      <Section>
        <RowBetween>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '24px', lineHeight: '32px', color: '#FBFBFD' }}>
            Review Swap
          </span>
          <span className="absolute top-[16px] right-[16px]">
            <CloseIcon color="#B8ADA4" onClick={onDismiss} />
          </span>
        </RowBetween>
        <div style={{ marginTop: 40 }}>
          <div className="flex justify-center mb-[20px]">
            <img src={cancel} className="w-[100px]" alt="Transaction failed" />
          </div>
          <p className="text-[32px] font-semibold text-[#FF3B6A] text-center mb-[20px]">Swap fail</p>

          <Text fontWeight={500} fontSize={16} color={theme.white} style={{ textAlign: 'center' }}>
            {message}
          </Text>
        </div>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
}

export function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content()
      )}
    </Modal>
  )
}
