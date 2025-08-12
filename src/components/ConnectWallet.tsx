import React from 'react'
import connectWalletIcon from 'assets/svg/account_balance_wallet.svg'
import { ButtonPrimary } from './Button'
import { useWalletModalToggle } from 'state/application/hooks'

const ConnectWallet = () => {
  const toggleWalletModal = useWalletModalToggle()

  const openConnectWallet = () => {
    const connectBtn = document.querySelector('[data-testid="rk-connect-button"]')
    if (connectBtn) {
      // @ts-ignore
      connectBtn.click()
    } else {
      toggleWalletModal()
    }
  }

  return (
    <ButtonPrimary onClick={openConnectWallet}>
      <img src={connectWalletIcon} alt="icon" className="w-[24px] mr-2" />
      Connect Wallet
    </ButtonPrimary>
  )
}

export default ConnectWallet
