import { useChainModal } from '@rainbow-me/rainbowkit'
import { ButtonDropdown } from 'components/Button'
import { availableChains } from 'connectors'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { chainSelector, switchChain } from 'state/chainSlice'
import { useAccount } from 'wagmi'

const CustomChainSelect = () => {
  const { isConnected, chainId } = useAccount()
  const chain = useSelector(chainSelector)
  const isWrongNetwork = availableChains.every((chain) => chain.id !== chainId)

  const { openChainModal } = useChainModal()
  const [isOpen, setOpen] = useState(false)

  if (isConnected && !isWrongNetwork) return <div />

  return (
    <>
      <ButtonDropdown
        className="!bg-black/40 hover:scale-105 transition-all !py-1 !px-2.5 !min-h-10 !rounded-xl !w-fit"
        style={{ border: '1px solid #FFFFFF20' }}
        onClick={openChainModal || (() => setOpen(true))}
      >
        <img className="w-5 mr-2 rounded-full" src={chain.iconUrl as string} />
        <div className="hidden sm:block">{chain.name}</div>
      </ButtonDropdown>

      <ChainModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  )
}

const ChainModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const chain = useSelector(chainSelector)
  const dispatch = useDispatch()

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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-white text-lg font-[800] px-2 pt-1"
            style={{
              fontFamily: `SFRounded, ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
            }}
          >
            Switch Networks
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition p-1 w-8 rounded-full">
            ✕
          </button>
        </div>

        {/* Chain list */}
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
                }}
                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-xl transition
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
