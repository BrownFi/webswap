import { useQuery } from '@tanstack/react-query'
import Column from 'components/Column'
import AppBody from 'pages/AppBody'
import React from 'react'
import { internalService } from 'services'
import { TYPE } from 'theme'
import { shortenAddress } from 'utils'
import { Table } from './styleds'
import { useAccount } from 'wagmi'
import Rank from './Rank'

const Leaderboard = () => {
  const { address } = useAccount()

  const { data: leaderboard } = useQuery({
    queryKey: ['fetchLeaderboard'],
    queryFn: () => {
      return internalService.fetchLeaderboard({ limit: 10 })
    }
  })

  const { data: userRank } = useQuery({
    queryKey: ['getUserRank', address],
    queryFn: () => {
      return internalService.getUserRank(address ?? '')
    },
    enabled: !!address
  })

  const includeUser = leaderboard?.items.some(item => item.address === address)

  return (
    <>
      <TYPE.main mb={3} color="#bb9981">
        For detailed campaign rules, please visit{' '}
        <a
          href="https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa/2B15PH8O0xhUrVwaOnMQ9F2uBxMvgTfX9Jjbj8PikIQ"
          target="_blank"
          className="cursor-pointer hover:underline"
          rel="noreferrer"
        >
          HERE
        </a>
        .
      </TYPE.main>
      <AppBody>
        <Column className="lg:p-8 p-5 !pb-0 gap-6">
          <TYPE.mediumHeader style={{ fontFamily: 'Russo One', fontSize: '24px' }} color={'white'}>
            Leaderboard
          </TYPE.mediumHeader>
          <Table>
            <thead>
              <tr>
                <td>Rank</td>
                <td>Address</td>
                <td>Points</td>
              </tr>
            </thead>
            <tbody>
              {address && !includeUser && (
                <>
                  <tr className="bg-[#4d4b49]">
                    <td>
                      <Rank rank={userRank?.rank || 0} />
                    </td>
                    <td>{shortenAddress(address)} (You)</td>
                    <td className="text-center">{Number(userRank?.volume || 0).toFixed(1)}</td>
                  </tr>
                </>
              )}
              {leaderboard?.items.map((row, index) => {
                const isUser = row.address === address
                return (
                  <tr key={row.address} className={'border-b ' + (isUser ? 'bg-[#4d4b49]' : '')}>
                    <td>
                      <Rank rank={index + 1} />
                    </td>
                    <td>
                      {shortenAddress(row.address)} {isUser && '(You)'}
                    </td>
                    <td className="text-center">{Number(+row.volume).toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>

          <TYPE.darkGray className="italic text-sm">* This leaderboard displays top 10 participants only</TYPE.darkGray>
        </Column>
      </AppBody>
    </>
  )
}

export default Leaderboard
