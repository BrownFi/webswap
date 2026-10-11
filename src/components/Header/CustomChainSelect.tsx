import { HEMI_CHAIN_ID, selectableChains } from 'connectors'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { chainSelector, switchChain } from 'state/chainSlice'
import { useAccount, useSwitchChain } from 'wagmi'
import { useLocation, useNavigate } from 'react-router-dom'

const CustomChainSelect = () => {
  const { isConnected } = useAccount()
  const chain = useSelector(chainSelector)
  const location = useLocation()
  const { switchChainAsync } = useSwitchChain()

  const [isOpen, setOpen] = useState(false)

  const hemiChain = selectableChains.find((candidate) => candidate.id === HEMI_CHAIN_ID)
  const onClamm = location.pathname.startsWith('/clamm')
  const displayChain = onClamm && hemiChain ? hemiChain : chain
  const displayName = onClamm ? 'Hemi CLAMM' : displayChain.name

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
        <img style={{ width: '18px', height: '18px', borderRadius: '50%' }} src={displayChain.iconUrl as string} alt={displayName} />
        <span style={{ color: '#FBFBFD', fontSize: '13px', fontWeight: 500 }}>{displayName}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#978A80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <ChainModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        onSwitchChain={(chainId) => switchChainAsync({ chainId })}
      />
    </>
  )
}

// One selectable row. Hemi appears TWICE — once as the BrownFi V3 chain ("Hemi")
// and once as the separate CLAMM product ("Hemi CLAMM"). Both share wagmi chain
// id 43111; only the route distinguishes them, so `clamm` rides along as the
// FE-side mode and the active highlight keys off the current pathname.
type ChainRow = { chain: (typeof selectableChains)[number]; clamm: boolean }

export const ChainModal = ({
  isOpen,
  onClose,
  onSwitchChain,
}: {
  isOpen: boolean
  onClose: () => void
  // May return a promise (wagmi's switchChainAsync). It is awaited before routing
  // so CLAMM isn't entered while the wallet is still on the previous chain — see
  // the click handler below.
  onSwitchChain?: (chainId: number) => void | Promise<unknown>
}) => {
  const chain = useSelector(chainSelector)
  const dispatch = useDispatch()
  const { chainId: walletChainId } = useAccount()
  const location = useLocation()
  const navigate = useNavigate()
  const onClamm = location.pathname.startsWith('/clamm')
  const activeChainId = walletChainId ?? (onClamm ? HEMI_CHAIN_ID : chain?.id)

  const rows: ChainRow[] = selectableChains.flatMap((c) =>
    c.id === HEMI_CHAIN_ID ? [{ chain: c, clamm: false }, { chain: c, clamm: true }] : [{ chain: c, clamm: false }],
  )

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
          {rows.map(({ chain: c, clamm }) => {
            // Same wagmi chain id for both Hemi rows → disambiguate by route mode.
            const isActive = activeChainId === c.id && (c.id !== HEMI_CHAIN_ID || clamm === onClamm)
            const label = clamm ? 'Hemi CLAMM' : c.name

            return (
              <button
                key={`${c.id}${clamm ? '-clamm' : ''}`}
                onClick={async () => {
                  onClose()
                  // CLAMM is a standalone app shell with its own config — it never
                  // reads the webswap redux chain, so only non-CLAMM picks update it.
                  if (!clamm) {
                    const parsed = JSON.parse(JSON.stringify(c, null, 2))
                    dispatch(switchChain(parsed))
                  }
                  // AWAIT the wallet switch before routing. ChainRouteSync ejects
                  // from /clamm whenever the connected wallet isn't on Hemi, so
                  // navigating first would bounce the user straight back out while
                  // the switch is still pending approval. A rejected switch leaves
                  // the user where they are rather than on a product they can't use.
                  try {
                    await onSwitchChain?.(c.id)
                  } catch {
                    return
                  }
                  // Route follows the picked PRODUCT: CLAMM lives under /clamm,
                  // everything else (Hemi V3 included) is the regular webswap.
                  if (clamm && !onClamm) navigate('/clamm/swap')
                  else if (!clamm && onClamm) navigate('/swap')
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
                {c.iconUrl && <img src={c.iconUrl as string} alt={label} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                <span>{label}</span>
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
