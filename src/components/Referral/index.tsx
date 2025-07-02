import React, { useEffect, useState } from 'react'
import Copy from '../AccountDetails/Copy'
import { useActiveWeb3React } from 'hooks'
import useParsedQueryString from 'hooks/useParsedQueryString'
import axios from 'axios'

const client = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL
})

const ENABLED_REFERRAL = false

const Referral = () => {
  const { account } = useActiveWeb3React()
  const params = useParsedQueryString()
  const [numberReferrals, setNumberReferrals] = useState(0)

  useEffect(() => {
    const addReferral = async () => {
      try {
        await client.post(`/api/user/add-referral`, {
          owner: params.ref,
          walletAddress: account
        })
      } catch (e) {
        console.log(e)
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
        const result = await client.get(`/api/user/count-referral`, {
          params: {
            owner: account
          }
        })

        setNumberReferrals(result?.data?.data?.numberReferrals)
      } catch (e) {
        console.log(e)
      }
    }
    if (account) {
      if (ENABLED_REFERRAL) getReferrals()
    }
  }, [account])

  return (
    <div>
      <div className="flex items-center mb-[8px]">
        <p className="text-[24px] font-medium text-white mr-[8px]" style={{ fontFamily: "'Russo One',sans-serif" }}>
          Referral Link
        </p>
      </div>

      {account ? (
        <>
          <p className="text-[14px] font-medium text-white mb-[8px]">You invited: {numberReferrals} users</p>

          <div className="bg-[#131216] px-[16px] py-[12px] flex items-center">
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
        Invite your friends to get inventive rewards, airdrops and retros
      </p>
    </div>
  )
}

export default Referral
