import connectWalletIcon from 'assets/svg/account_balance_wallet.svg'
import { ButtonPrimary } from './Button'
import { useConnectModal } from '@rainbow-me/rainbowkit'

const ConnectWallet = () => {
  const { openConnectModal } = useConnectModal()

  return (
    <ButtonPrimary onClick={openConnectModal}>
      <img src={connectWalletIcon} alt="icon" className="w-[24px] mr-2" />
      Connect Wallet
    </ButtonPrimary>
  )
}

export default ConnectWallet
