import { ButtonDropdown } from 'components/Button'
import { availableChains } from 'connectors'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { chainSelector, switchChain } from 'state/chainSlice'
import { useAccount } from 'wagmi'

const CustomChainSelect = () => {
  const { isConnected, chainId } = useAccount()
  const chain = useSelector(chainSelector)
  const isWrongNetwork = availableChains.every((chain) => chain.id !== chainId)

  const [isOpen, setOpen] = useState(false)

  if (isConnected && !isWrongNetwork) return <div />

  return (
    <>
      <ButtonDropdown
        className="!bg-black/40 hover:scale-105 transition-all !py-1 !px-2.5 h-full !min-h-[41px] !rounded-none !w-fit border-1"
        style={{ border: '1px solid #FFFFFF20' }}
        onClick={() => setOpen(true)}
      >
        <img className="w-5 mr-2 rounded-full" src={chain.iconUrl as string} alt={chain.name} />
        <div>{chain.name}</div>
      </ButtonDropdown>

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

  if (!isOpen) return null
  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A1E] m-2 w-full max-w-sm p-4"
        style={{ border: '1px solid #FFFFFF20' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-white text-lg font-[800] px-2 pt-1"
            style={{
              fontFamily: `SFRounded, ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
            }}
          >
            Switch Networks
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 font-black hover:text-white transition p-1 w-8"
            aria-label="Close network selector"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {availableChains.map((c) => {
            const isActive = chain?.id === c.id

            return (
              <button
                key={c.id}
                onClick={() => {
                  onClose()
                  const parsed = JSON.parse(JSON.stringify(c, null, 2))
                  dispatch(switchChain(parsed))
                  if (onSwitchChain) onSwitchChain(c.id)
                }}
                className={`flex items-center justify-between w-full px-2 py-1 transition
                  ${isActive ? 'bg-[#3b82f6] text-white' : 'hover:bg-white/5 text-white/80'}
                `}
              >
                <div className="flex items-center gap-3 min-h-[28px]">
                  {c.iconUrl && <img src={c.iconUrl as string} alt={c.name} className="w-6 h-6 rounded-full" />}
                  <span className="font-bold">{c.name}</span>
                </div>
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
