import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { darken } from 'polished'
import React, { useMemo } from 'react'
import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg'
import connectWalletIcon from 'assets/svg/account_balance_wallet.svg'
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg'
import { injected, walletconnect, walletlink } from 'connectors'
import { NetworkContextName } from 'constants/common'
import useENSName from 'hooks/useENSName'
import { useHasSocks } from 'hooks/useSocksBalance'
import { useWalletModalToggle } from 'state/application/hooks'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { shortenAddress } from 'utils'
import { ButtonSecondary } from 'components/Button'

import { Identicon } from 'components/Identicon'
import { Loader } from 'components/Loader'

import { RowBetween } from 'components/Row'
import { WalletModal } from 'components/WalletModal'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
  border: 0;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: #773030;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 16px;
  height: 56px;
  width: 190px;
  border-radius: 0;

  :hover,
  :focus {
    border: 0;
    // color: ${({ theme }) => theme.primaryText1};
  }

  ${({ faded }) =>
    faded &&
    css`
      background-color: #773030;

      :hover,
      :focus {
        border: 0;
        // color: ${({ theme }) => darken(0.05, theme.primaryText1)};
      }
    `}
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: #1e1e1e;
  border: 0 !important;
  outline: 0;
  color: white;
  font-weight: 500;
  font-size: 16px;
  border-radius: 0;
  height: 56px;
  padding: 0 20px 0 8px;
  // width: 190px;
  :hover,
  :focus {
    background-color: #1e1e1e;
    border: 0 !important;
    :focus {
      border: 0 !important;
    }
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const SOCK = (
  <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
    🧦
  </span>
)

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return <Identicon />
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={40}>
        <img src={WalletConnectIcon} alt={''} />
      </IconWrapper>
    )
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={40}>
        <img src={CoinbaseWalletIcon} alt={''} />
      </IconWrapper>
    )
  }
  return null
}

function Web3StatusInner() {
  const { t } = useTranslation()
  const { account, connector, error } = useWeb3React()

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  const hasPendingTransactions = !!pending.length
  const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            {hasSocks ? SOCK : null}
            <p className="text-[16px] font-medium">{ENSName || shortenAddress(account)}</p>
          </>
        )}
      </Web3StatusConnected>
    )
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
      </Web3StatusError>
    )
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account}>
        <img src={connectWalletIcon} className="w-[24px] mr-[8px]" alt="ico" />
        <p className="text-[16px] font-bold">{t('Connect Wallet')}</p>
      </Web3StatusConnect>
    )
  }
}

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <div style={{ display: 'none' }}>
        <Web3StatusInner />
      </div>
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
