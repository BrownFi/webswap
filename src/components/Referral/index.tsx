import { useEffect, useState } from 'react'
import Copy from 'components/AccountDetails/Copy'
import { useActiveWeb3React } from 'hooks'
import useParsedQueryString from 'hooks/useParsedQueryString'
const BASE_URL = import.meta.env.VITE_API_URL

const ENABLED_REFERRAL = false

const Referral = () => {
  const { account } = useActiveWeb3React()
  const params = useParsedQueryString()
  const [numberReferrals, setNumberReferrals] = useState(0)

  useEffect(() => {
    const addReferral = async () => {
      try {
        await fetch(new URL('/api/user/add-referral', BASE_URL).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner: params.ref, walletAddress: account }),
        })
      } catch (e) {
        console.error('Failed to add referral', e)
      }
    }
    if (account && params.ref) {
      if (account.toLowerCase() !== (params.ref as string)?.toLowerCase()) {
        if (ENABLED_REFERRAL) addReferral()
      }
    }
  }, [account, params])

  useEffect(() => {
    const getReferrals = async () => {
      try {
        const url = new URL('/api/user/count-referral', BASE_URL)
        url.searchParams.set('owner', account!)
        const response = await fetch(url.toString())
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()

        setNumberReferrals(result?.data?.numberReferrals)
      } catch (e) {
        console.error('Failed to get referrals', e)
      }
    }
    if (account) {
      if (ENABLED_REFERRAL) getReferrals()
    }
  }, [account])

  return (
    <div>
      <div className="flex items-center mb-[8px]">
        <p className="text-[24px] font-medium text-white mr-[8px]" style={{ fontFamily: "'Inter',sans-serif" }}>
          Referral Link
        </p>
      </div>

      {account ? (
        <>
          <p className="text-[14px] font-medium text-white mb-[8px]">You invited: {numberReferrals} users</p>

          <div className="bg-[#12100b] px-[16px] py-[12px] flex items-center">
            <p className="text-[15px] text-white font-medium mr-[10px] truncate flex-1 w-[300px]">
              {location.href}?ref={account}
            </p>
            <Copy toCopy={`${location.href}?ref=${account}`}></Copy>
          </div>
        </>
      ) : (
        <>
          <p className="text-[14px] font-medium text-white mb-[8px]">Please connect wallet to see referral link</p>
        </>
      )}

      <p className="text-[14px] font-medium text-white italic mt-[8px]">
        Invite your friends to get incentive rewards, airdrops and retros
      </p>
    </div>
  )
}

export default Referral
