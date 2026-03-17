import React from 'react'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useWalletModalToggle } from 'state/application/hooks'
import { Modal } from 'components/Modal'
import { AccountDetails } from 'components/AccountDetails'
import { useActiveWeb3React } from 'hooks'

/**
 * Legacy WalletModal - RainbowKit now handles wallet connection.
 * This is kept as a minimal stub because it is still imported elsewhere.
 */
export function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
}: {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
}) {
  const { account } = useActiveWeb3React()
  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      {account ? (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={toggleWalletModal}
        />
      ) : null}
    </Modal>
  )
}
