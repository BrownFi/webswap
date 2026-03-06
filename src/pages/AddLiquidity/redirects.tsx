import React from 'react'
import { Navigate, useParams } from 'react-router-dom'
import AddLiquidity from './index'

export function RedirectToAddLiquidity() {
  return <Navigate to="/add/" replace />
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/
export function RedirectOldAddLiquidityPathStructure() {
  const { currencyIdA } = useParams<{ currencyIdA: string }>()
  const match = currencyIdA?.match(OLD_PATH_STRUCTURE)
  if (match?.length) {
    return <Navigate to={`/add/${match[1]}/${match[2]}`} replace />
  }

  return <AddLiquidity />
}

export function RedirectDuplicateTokenIds() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()
  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Navigate to={`/add/${currencyIdA}`} replace />
  }
  return <AddLiquidity />
}
