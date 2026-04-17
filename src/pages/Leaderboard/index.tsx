import { useQuery } from '@tanstack/react-query'
import Column from 'components/Column'
import { apiV1Service } from 'services'
import { shortenAddress } from 'utils'
import { Table } from './styleds'
import { useAccount } from 'wagmi'
import Rank from './Rank'

const Leaderboard = () => {
  const { address } = useAccount()

  const { data: leaderboard } = useQuery({
    queryKey: ['fetchLeaderboard'],
    queryFn: () => {
      return apiV1Service.fetchLeaderboard({ limit: 10 })
    },
  })

  const { data: userRank } = useQuery({
    queryKey: ['getUserRank', address],
    queryFn: () => {
      return apiV1Service.getUserRank(address ?? '')
    },
    enabled: !!address,
  })

  const includeUser = leaderboard?.items.some((item) => item.address === address)

  return (
    <>
      <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#978A80', marginBottom: '12px', display: 'block', maxWidth: '690px', textAlign: 'center' }}>
        For detailed campaign rules, please visit{' '}
        <a
          href="https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa/2B15PH8O0xhUrVwaOnMQ9F2uBxMvgTfX9Jjbj8PikIQ"
          target="_blank"
          className="cursor-pointer hover:underline"
          style={{ color: '#C47736' }}
          rel="noreferrer"
        >
          HERE
        </a>
        .
      </span>
      <div
        className="w-full p-[16px] sm:p-[32px] rounded-[20px] sm:rounded-[32px]"
        style={{
          maxWidth: '1280px',
          background: '#1E1915',
          border: '1px solid #2F2823',
        }}
      >
        <Column className="gap-6">
          <span
            className="text-[24px] sm:text-[36px] leading-[32px] sm:leading-[44px]"
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#D8A072',
            }}
          >
            Leaderboard
          </span>
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
                <tr style={{ background: '#2F2823' }}>
                  <td>
                    <Rank rank={userRank?.rank || 0} />
                  </td>
                  <td>{shortenAddress(address)} (You)</td>
                  <td className="text-center">{Number(userRank?.volume || 0).toFixed(1)}</td>
                </tr>
              )}
              {leaderboard?.items.map((row, index) => {
                const isUser = row.address === address
                return (
                  <tr key={row.address} style={isUser ? { background: '#2F2823' } : undefined}>
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

          <span style={{ fontFamily: 'Inter', fontSize: '12px', fontStyle: 'italic', color: '#978A80' }}>
            * This leaderboard displays top 10 participants only
          </span>
        </Column>
      </div>
    </>
  )
}

export default Leaderboard
