import { useEffect, useState } from 'react'
import { useActiveWeb3React } from '../../hooks'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'
import { useDispatch } from 'react-redux'

export default function Updater(): null {
  const { library, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null
  })

  // Attach / Detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null })

    const currentChainId = parseInt((library.provider as any).chainId) || chainId

    const updateBlockNumber = (chainId: number, blockNumber: number) => {
      setState(state => {
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
      .then(blockNumber => updateBlockNumber(currentChainId, blockNumber))
      .catch(error => console.error(`Failed to get block number for chainId: ${currentChainId}`, error))

    library.on('block', blockNumber => updateBlockNumber(currentChainId, blockNumber))
    return () => {
      library.removeListener('block', blockNumber => updateBlockNumber(currentChainId, blockNumber))
    }
  }, [dispatch, chainId, library, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        blockNumber: debouncedState.blockNumber - 3 // TODO: blockNumber
      })
    )
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
