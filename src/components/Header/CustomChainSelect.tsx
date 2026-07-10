import { selectableChains, HEMI_CHAIN_ID } from 'connectors'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { chainSelector, switchChain } from 'state/chainSlice'
import { useAccount } from 'wagmi'

const CustomChainSelect = () => {
  const { isConnected } = useAccount()
  const chain = useSelector(chainSelector)

  const [isOpen, setOpen] = useState(false)

  // Only the pre-connect network picker. Once connected, the RainbowKit button
  // (StyledConnectButton) is the single chain selector — including Hemi.
  if (isConnected) return <div />

  return (
    <>
      <button
        className="inline-flex items-center gap-2 border-none hover:opacity-80 transition-all cursor-pointer"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: 'transparent',
          padding: '6px 10px',
          height: '36px',
        }}
        onClick={() => setOpen(true)}
      >
        <img style={{ width: '18px', height: '18px', borderRadius: '50%' }} src={chain.iconUrl as string} alt={chain.name} />
        <span style={{ color: '#FBFBFD', fontSize: '13px', fontWeight: 500 }}>{chain.name}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#978A80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <ChainModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  )
}

export const ChainModal = ({
  isOpen,
  onClose,
  onSwitchChain,
}: {
  isOpen: boolean
  onClose: () => void
  onSwitchChain?: (chainId: number) => void
}) => {
  const chain = useSelector(chainSelector)
  const dispatch = useDispatch()
  const { chainId: walletChainId } = useAccount()

  if (!isOpen) return null
  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
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
        <div className="flex items-center justify-between mb-6">
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px', lineHeight: '30px', color: '#FBFBFD' }}>
            Switch Networks
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            aria-label="Close network selector"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#B8ADA4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectableChains.map((c) => {
            const isHemi = c.id === HEMI_CHAIN_ID
            // Hemi is active by the wallet's actual chain; webswap chains by the
            // redux-selected chain (Hemi is never stored in redux).
            const isActive = isHemi ? walletChainId === HEMI_CHAIN_ID : chain?.id === c.id

            return (
              <button
                key={c.id}
                onClick={() => {
                  onClose()
                  // Never write Hemi into webswap's redux chain — its product
                  // logic would then try to operate on Hemi and crash. Just
                  // switch the wallet; ChainRouteSync routes into /clmm.
                  if (!isHemi) {
                    const parsed = JSON.parse(JSON.stringify(c, null, 2))
                    dispatch(switchChain(parsed))
                  }
                  if (onSwitchChain) onSwitchChain(c.id)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                  background: isActive ? '#985C2A' : '#120F0D',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: isActive ? '#FFFFFF' : '#CFC7C1',
                }}
              >
                {c.iconUrl && <img src={c.iconUrl as string} alt={c.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CustomChainSelect
