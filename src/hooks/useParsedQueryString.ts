import { useMemo } from 'react'

import { ParsedQs, parse } from 'qs'
import { useLocation } from 'react-router-dom'

export default function useParsedQueryString(): ParsedQs {
  const { search } = useLocation()
  return useMemo(
    () => (search && search.length > 1 ? parse(search, { parseArrays: false, ignoreQueryPrefix: true }) : {}),
    [search],
  )
}
