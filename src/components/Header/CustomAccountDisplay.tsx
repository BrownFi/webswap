import { ETHER } from '@brownfi/sdk'
import { useAccountModal } from '@rainbow-me/rainbowkit'
import { ButtonDropdown } from 'components/Button'
import { availableChains } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, LogOut } from 'react-feather'
import { useETHBalances } from 'state/wallet/hooks'
import { getTokenSymbol, shortenAddress } from 'utils'
import { useAccount, useDisconnect } from 'wagmi'

const CustomAccountDisplay = () => {
  const { account } = useActiveWeb3React()
  const { isConnected, chainId } = useAccount()
  const isWrongNetwork = availableChains.every((chain) => chain.id !== chainId)

  const { openAccountModal } = useAccountModal()
  const [isOpen, setOpen] = useState(false)

  if (isConnected && !isWrongNetwork) return <div />

  return (
    <>
      <ButtonDropdown
        className="!bg-black/40 hover:scale-105 transition-all !py-1 !px-2.5 !min-h-10 !rounded-xl !w-fit"
        style={{ border: '1px solid #FFFFFF20' }}
        onClick={openAccountModal || (() => setOpen(true))}
      >
        🤠
        <div className="ml-2">{shortenAddress(account!)}</div>
      </ButtonDropdown>

      <AccountModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  )
}

const AccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { account, chainId, connector, deactivate } = useActiveWeb3React()
  const { disconnect } = useDisconnect()

  const [isCopying, setIsCopying] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const ethBalance = useETHBalances(account ? [account] : [])

  const balance = Object.values(ethBalance ?? {})[0]

  const handleCopy = async () => {
    try {
      // Clear old timeout if user clicks again
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setIsCopying(true)
      await navigator.clipboard.writeText(account || '')

      // Restart timeout
      timeoutRef.current = setTimeout(() => {
        setIsCopying(false)
        timeoutRef.current = null
      }, 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
      setIsCopying(false)
    }
  }

  if (!isOpen) return null
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex sm:items-center items-end pb-[72px] sm:pb-0 justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] m-2 rounded-3xl w-full max-w-sm p-4"
        style={{ border: '1px solid #FFFFFF20' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-white/15 text-white/60 font-black hover:text-white  transition p-1 w-8 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Chain list */}
        <div className="space-y-2">
          <div className="flex justify-center items-center w-[82px] h-[82px] bg-[#ffb35a] rounded-full mx-auto text-[45px]">
            🤠
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-[20px]">{shortenAddress(account!)}</div>
            <div className="text-white/60 font-semibold">
              {balance?.toSignificant(2)} {getTokenSymbol(balance?.currency, chainId)}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex flex-1 flex-col items-center rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold p-2"
              onClick={handleCopy}
            >
              {isCopying ? <Check size={16} /> : <Copy size={16} />}
              <div className="text-sm">{isCopying ? 'Copied!' : 'Copy Address'}</div>
            </button>
            <button
              className="flex flex-1 flex-col items-center rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold p-2"
              onClick={() => {
                if ((connector as any)?.handleClose) {
                  ;(connector as any).handleClose()
                }
                if ((connector as any)?.close) {
                  ;(connector as any).close()
                }
                deactivate()
                disconnect()
              }}
            >
              <LogOut size={16} />
              <div className="text-sm">Disconnect</div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CustomAccountDisplay
