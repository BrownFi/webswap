import { useEffect, useState } from 'react'
import { useActiveWeb3React } from 'hooks'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'
import { useDispatch } from 'react-redux'
import { useAccount } from 'wagmi'
import { HEMI_CHAIN_ID } from 'connectors'

export default function Updater(): null {
  const { library, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()

  // On Hemi (CLMM) the wallet is on a non-webswap chain, so useActiveWeb3React
  // clamps chainId to the last webswap chain and its read-only provider — block
  // polling here would hit that chain's RPC (e.g. Arbitrum) for nothing, since no
  // webswap page is shown on Hemi. Pause until the wallet is back on a webswap chain.
  const { chainId: walletChainId } = useAccount()
  const onHemi = walletChainId === HEMI_CHAIN_ID

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  })

  // Attach / Detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible || onHemi) return undefined

    setState({ chainId, blockNumber: null })

    const currentChainId = chainId

    const updateBlockNumber = (blockNumber: number) => {
      const chainId = currentChainId
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') {
            return { chainId, blockNumber }
          }
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    }

    library
      .getBlockNumber()
      .then(updateBlockNumber)
      .catch(() => {
        // Fallback to a low block number so the UI isn't stuck on null — the
        // 'block' listener will correct it once a real block arrives.
        updateBlockNumber(10)
      })

    library.on('block', updateBlockNumber)
    return () => {
      library.removeListener('block', updateBlockNumber)
    }
  }, [dispatch, chainId, library, windowVisible, onHemi])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        // Subtract a few blocks as a reorg safety buffer so multicall reads
        // target a block that is highly likely to be finalized.
        blockNumber: debouncedState.blockNumber - 3,
      }),
    )
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
