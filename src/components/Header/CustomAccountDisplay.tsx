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
        className="!bg-transparent hover:!bg-[#c4943a15] transition-all !py-2 !px-4 h-full !min-h-10 !rounded-full !w-fit"
        style={{ border: '1px solid rgba(196,148,58,0.4)' }}
        onClick={openAccountModal || (() => setOpen(true))}
      >
        🤠
        <div className="ml-2">{shortenAddress(account!)}</div>
      </ButtonDropdown>

      <AccountModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  )
}

export const AccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { account, chainId } = useActiveWeb3React()
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        style={{
          background: '#1E1915',
          border: '1px solid #2F2823',
          borderRadius: '24px',
          padding: '24px',
          margin: '8px',
          width: '100%',
          maxWidth: '420px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end mb-2">
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#B8ADA4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '82px', height: '82px', background: '#2F2823', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '45px' }}>
            🤠
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', color: '#FBFBFD' }}>{shortenAddress(account!)}</div>
            <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#978A80', marginTop: '4px' }}>
              {balance?.toSignificant(6)} {getTokenSymbol(balance?.currency, chainId)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '12px',
                background: '#120F0D',
                border: '1px solid #2F2823',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '14px',
                color: '#CFC7C1',
              }}
            >
              {isCopying ? <Check size={16} color="#83CF84" /> : <Copy size={16} color="#B8ADA4" />}
              <span>{isCopying ? 'Copied!' : 'Copy Address'}</span>
            </button>
            <button
              onClick={() => disconnect()}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '12px',
                background: '#120F0D',
                border: '1px solid #2F2823',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '14px',
                color: '#CFC7C1',
              }}
            >
              <LogOut size={16} color="#B8ADA4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CustomAccountDisplay
