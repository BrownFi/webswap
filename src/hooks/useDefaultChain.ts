import { useCallback, useMemo } from 'react'

import { ChainId } from '@brownfi/sdk'

import { useStorageSlot } from 'utils/storage'

export const DEFAULT_CHAIN = 'chain'

const parseStorage = (data: string | null) => {
  if (!data) {
    return {}
  }
  try {
    return JSON.parse(data) as Record<string, string>
  } catch {
    return {}
  }
}

export const useDefaultChain = () => {
  const [rawStorageData, storage] = useStorageSlot(DEFAULT_CHAIN)

  const storageData = useMemo(() => {
    return parseStorage(rawStorageData)
  }, [rawStorageData])

  const savedChain = useMemo(() => {
    if (!storageData || !storageData[`mainnet`]) {
      return
    }
    return storageData[`mainnet`]
  }, [storageData])

  const saveChainDefault = useCallback(
    (c: ChainId) => {
      if (!c) {
        return
      }
      storageData[`mainnet`] = c.toString()
      storage.set(JSON.stringify(storageData))
    },
    [storage, storageData],
  )

  const getChainDefault = useCallback(() => {
    if (!savedChain) {
      return
    }
    return savedChain
  }, [savedChain])

  return {
    getChainDefault,
    saveChainDefault,
  }
}
