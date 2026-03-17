import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, useParams, useLocation } from 'react-router-dom'
import { AppDispatch } from 'state'
import { ApplicationModal, setOpenModal } from 'state/application/actions'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly() {
  const location = useLocation()
  return <Navigate to={{ pathname: '/swap', search: location.search, hash: location.hash }} replace />
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToSwap() {
  const location = useLocation()
  const { outputCurrency } = useParams<{ outputCurrency: string }>()
  const { search } = location

  return (
    <Navigate
      to={{
        pathname: '/swap',
        hash: location.hash,
        search:
          search && search.length > 1
            ? `${search}&outputCurrency=${outputCurrency}`
            : `?outputCurrency=${outputCurrency}`,
      }}
      replace
    />
  )
}

export function OpenClaimAddressModalAndRedirectToSwap() {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch(setOpenModal(ApplicationModal.ADDRESS_CLAIM))
  }, [dispatch])
  return <RedirectPathToSwapOnly />
}
