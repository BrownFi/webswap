import { useLocalStorage } from 'usehooks-ts'

type Props = {
  key: string
  initValue: any
  cacheTime: number
}

type Data = {
  expireTime?: number
  data: any
}

export const useStorageCache = ({ key, initValue, cacheTime }: Props) => {
  const [value, setValue] = useLocalStorage<Data>(key, { data: initValue })

  const save = (data: any, cache = cacheTime) => {
    setValue({
      data,
      expireTime: Date.now() + cache * 1000,
    })
    return data
  }

  const isAvailable = () => {
    return value?.expireTime ? value.expireTime > Date.now() : false
  }

  // Return cached data when present, even past expireTime. The expiry only
  // gates whether a refetch fires (via isAvailable). Returning initValue here
  // would flash the UI back to zeros/undefined every time the cache window
  // ends, while the refetch is still in flight. Falling through to initValue
  // only happens when the cache was never written (first-ever visit).
  const get = () => value?.data ?? initValue

  return { save, get, isAvailable }
}
