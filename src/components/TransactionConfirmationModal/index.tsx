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
import { getEtherscanLink, getScanText, getTokenSymbol } from 'utils'
import { useActiveWeb3React } from 'hooks'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import { useAllTransactions } from 'state/transactions/hooks'

type TxState = 'pending' | 'success' | 'failed'

// Outlined status icons matched to the dark/brown palette — soft tinted fill
// plus a thin ring and clean stroke, rather than the cartoonish solid badges.
function SuccessIcon({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" stroke="#83CF84" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="36" fill="#83CF84" fillOpacity="0.12" />
      <path
        d="M32 49.5L43 60L65 36"
        stroke="#83CF84"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FailedIcon({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" stroke="#FF3B6A" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="36" fill="#FF3B6A" fillOpacity="0.12" />
      <path
        d="M34 34L62 62M62 34L34 62"
        stroke="#FF3B6A"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 32px 40px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 24px 20px;
  `}
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
  submittedText,
  txState,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
  submittedText?: string
  txState: TxState
}) {
  const theme = useContext(ThemeContext)
  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  // Failed receipt — Uniswap/Aerodrome-style "Transaction Failed" view.
  // Keeps the explorer link so the user can inspect the revert reason.
  if (txState === 'failed') {
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
            <FailedIcon />
          </ConfirmedIcon>
          <AutoColumn gap="12px" justify={'center'}>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '28px', lineHeight: '36px', color: '#FF3B6A', textAlign: 'center' }}>
              Transaction Failed
            </span>
            {chainId && hash && (
              <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>
                <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#FF3B6A' }}>
                  View on {getScanText(chainId)}
                </span>
              </ExternalLink>
            )}
            <ButtonPrimary padding="6px 12px" width="100%" style={{ marginTop: '12px' }} onClick={onDismiss}>
              Dismiss
            </ButtonPrimary>
          </AutoColumn>
        </Section>
      </Wrapper>
    )
  }

  // Pending: hash exists but receipt hasn't arrived. Success: mined OK.
  const isPending = txState === 'pending'
  const title = isPending ? 'Transaction Submitted' : 'Transaction Confirmed'

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
          {isPending ? <CustomLightSpinner src={Circle} alt="mining" size={'90px'} /> : <SuccessIcon />}
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '28px', lineHeight: '36px', color: '#83CF84', textAlign: 'center' }}>
            {title}
          </span>
          {submittedText && (
            <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#CFC7C1', textAlign: 'center' }}>
              {submittedText}
            </span>
          )}
          {chainId && hash && (
            <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>
              <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#83CF84' }}>
                View on {getScanText(chainId)}
              </span>
            </ExternalLink>
          )}
          {!isPending && (
            // Stack on mobile to avoid the longer "Add SYMBOL to wallet" label
            // overflowing in a flex:1 column. Side-by-side from sm: up.
            <div className="flex flex-col sm:flex-row gap-2 w-full" style={{ marginTop: '12px' }}>
              {currencyToAdd && !!window?.ethereum && (
                <ButtonPrimary padding="6px 12px" style={{ flex: 1 }} onClick={addToken}>
                  {!success ? (
                    <RowFixed>Add {getTokenSymbol(currencyToAdd, chainId)} to wallet</RowFixed>
                  ) : (
                    <RowFixed>
                      Added {getTokenSymbol(currencyToAdd, chainId)}{' '}
                      <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                    </RowFixed>
                  )}
                </ButtonPrimary>
              )}
              <ButtonPrimary
                padding="6px 12px"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #493E35',
                  color: '#FBFBFD',
                }}
                onClick={onDismiss}
              >
                Close
              </ButtonPrimary>
            </div>
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
            <FailedIcon />
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
  submittedText?: string
  currencyToAdd?: Currency | undefined
}

export function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  submittedText,
  content,
  currencyToAdd,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()
  const allTxns = useAllTransactions()
  // Watch the finalized receipt for the current hash. Updater.tsx polls and
  // fills `receipt` once the tx is mined; status 1 = success, 0 = revert.
  const receipt = hash ? allTxns[hash]?.receipt : undefined
  const txState: TxState = !receipt ? 'pending' : receipt.status === 1 ? 'success' : 'failed'

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
          submittedText={submittedText}
          txState={txState}
        />
      ) : (
        content()
      )}
    </Modal>
  )
}
