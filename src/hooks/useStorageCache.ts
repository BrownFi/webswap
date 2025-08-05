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
  const [value, setValue, clear] = useLocalStorage<Data>(key, { data: initValue })

  const save = (data: any, cache = cacheTime) => {
    setValue({
      data,
      expireTime: Date.now() + cache * 1000
    })
    return data
  }

  const isExpired = () => {
    if (!value || !value.expireTime) return true
    const expired = value.expireTime < Date.now()
    if (expired) clear()
    return expired
  }

  const get = () => {
    if (isExpired()) {
      return initValue
    }
    return value.data
  }

  return { save, get, isExpired }
}
