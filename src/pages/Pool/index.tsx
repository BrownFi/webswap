import { ChainId, JSBI, Pair, Token, TokenAmount } from '@brownfi/sdk'
import { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'

import { useQuery } from '@apollo/client'
import { gql } from '__generated__'
import SwitchVersion from 'components/SwitchVersion'
import { useVersion } from 'hooks/useVersion'
import { Address, checksumAddress } from 'viem'

import { Flex, Text } from 'rebass'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import FullPositionCard from 'components/PositionCard'
import { RowBetween } from 'components/Row'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { TYPE } from 'theme'

import { PairStats } from 'components/PositionCard/usePoolStats'
import { Dots } from 'components/swap/styleds'
import { BIG_INT_ZERO } from 'constants/common'
import { usePairs } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { useStakingInfo } from 'state/stake/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { isMainnet } from 'connectors'

const PageWrapper = styled(AutoColumn)`
  max-width: 894px;
  width: 100%;
  background-color: #1d1c21;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const LIST_ALL_PAIRS = gql(`
  query PairList($chainId: Int) {
    pairs(where: {chainId: $chainId}) {
      totalCount
      items {
        chainId
        address
        fee
        totalSupply
        reserve0
        reserve1
        tvl
        apr
        volumeDay
        volume7Day
        updatedAt
        token0 {
          address
          chainId
          decimals
          name
          price
          priceFeedId
          symbol
          totalSupply
        }
        token1 {
          address
          chainId
          decimals
          name
          price
          priceFeedId
          symbol
          totalSupply
        }
      }
    }
  }
`)

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()
  const { version, enableGraphQL } = useVersion({ chainId })

  const { data } = useQuery(LIST_ALL_PAIRS, {
    variables: { chainId },
    pollInterval: 1 * 60 * 1000,
    skip: !enableGraphQL,
  })
  const sortedPairs = (data?.pairs.items ?? [])
    .slice()
    .sort((pairA: PairStats, pairB: PairStats) => pairB.tvl - pairA.tvl)

  const filteredPairs = sortedPairs.filter((pair) => {
    const symbol = `${pair.token0?.symbol}/${pair.token1?.symbol}`
    if (isMainnet) {
      if (pair.chainId === ChainId.ARBITRUM_MAINNET) {
        return !['WBTC/WETH', 'WETH/USD₮0'].includes(symbol)
      }
    }
    return true
  })

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs({ disabled: filteredPairs.length > 0 })
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens, version), tokens })),
    [trackedTokenPairs],
  )

  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])
  const [, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(account ?? undefined, liquidityTokens)

  const liquidityTokensWithBalances = tokenPairsWithLiquidityTokens

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))

  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // show liquidity even if its deposited in rewards contract
  const stakingInfo = useStakingInfo()
  const stakingInfosWithBalance = stakingInfo?.filter((pool) => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const stakingPairs = usePairs(stakingInfosWithBalance?.map((stakingInfo) => stakingInfo.tokens))

  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter((v2Pair) => {
    return (
      stakingPairs
        ?.map((stakingPair) => stakingPair[1])
        .filter((stakingPair) => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    )
  })

  return (
    <>
      {chainId === ChainId.BERA_MAINNET && version === 1 && (
        <TYPE.main mb={3} color="#bb9981" className="max-w-[894px] px-2">
          With the release of V2, our V1 platform will soon be deprecated. Please withdraw your liquidity from V1 and
          redeposit to V2 now to keep earning fees.{' '}
          <a
            href="https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa/QhlhP7rD3eN8COu8wEk-Co4oyk0vXyAM3XGiLVQgI3E"
            target="_blank"
            className="cursor-pointer hover:underline"
            rel="noreferrer"
          >
            Learn More
          </a>
        </TYPE.main>
      )}
      {version === 2 && (
        <TYPE.main mb={3} color="#bb9981" className="max-w-[894px] px-2">
          BrownFi is a novel primitive AMM in DeFi. While audited by{' '}
          <a
            href="https://skynet.certik.com/projects/brownfi"
            target="_blank"
            className="cursor-pointer hover:underline"
            rel="noreferrer"
          >
            Certik
          </a>{' '}
          and{' '}
          <a
            href="https://github.com/verichains/public-audit-reports/blob/main/Verichains%20Public%20Audit%20Report%20-%20BrownFi%20AMM%20Smartcontracts%20-%20v1.0.pdf"
            target="_blank"
            className="cursor-pointer hover:underline"
            rel="noreferrer"
          >
            Verichain
          </a>
          , pools marked &quot;Beta&quot; may experience instability during this phase—please use them with caution and
          be aware of the risks.
        </TYPE.main>
      )}

      <PageWrapper>
        <AutoColumn gap="lg" justify="center" className="p-[20px] lg:p-[32px]">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow padding={'0'}>
              <Flex alignItems="center" className="gap-6">
                <TYPE.mediumHeader style={{ fontFamily: 'Russo One', fontSize: '24px' }} color={'white'}>
                  All Pools
                </TYPE.mediumHeader>
                <SwitchVersion />
              </Flex>
              <div className="flex items-center justify-end flex-1 w-full lg:w-auto">
                <ResponsiveButtonPrimary id="join-pool-button" as={Link} to="/add/ETH" className="!h-[40px]">
                  <Text fontWeight={700} fontSize={14} color={'white'}>
                    Add Liquidity
                  </Text>
                </ResponsiveButtonPrimary>
              </div>
            </TitleRow>

            {enableGraphQL && filteredPairs.length > 0 ? (
              <>
                {filteredPairs.map((item: PairStats) => {
                  const { token0, token1 } = item
                  const pair = new Pair(
                    new TokenAmount(
                      new Token(
                        chainId,
                        checksumAddress(token0!.address as Address),
                        token0!.decimals,
                        token0?.symbol,
                        token0?.name,
                      ),
                      JSBI.BigInt(Math.round(item.reserve0 * 10 ** token0!.decimals)),
                    ),
                    new TokenAmount(
                      new Token(
                        chainId,
                        checksumAddress(token1!.address as Address),
                        token1!.decimals,
                        token1?.symbol,
                        token1?.name,
                      ),
                      JSBI.BigInt(Math.round(item.reserve1 * 10 ** token1!.decimals)),
                    ),
                    version,
                  )
                  return (
                    <FullPositionCard
                      key={checksumAddress(item.address as Address)}
                      pair={pair}
                      pairStats={item as PairStats}
                    />
                  )
                })}
              </>
            ) : (
              <>
                {v2IsLoading ? (
                  <EmptyProposals>
                    <TYPE.body color={theme.text3} textAlign="center">
                      <Dots>Loading</Dots>
                    </TYPE.body>
                  </EmptyProposals>
                ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
                  <>
                    {v2PairsWithoutStakedAmount.map((v2Pair) => (
                      <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                    ))}
                    {stakingPairs.map(
                      (stakingPair, i) =>
                        stakingPair[1] && ( // skip pairs that arent loaded
                          <FullPositionCard
                            key={stakingInfosWithBalance[i].stakingRewardAddress}
                            pair={stakingPair[1]}
                            stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                          />
                        ),
                    )}
                  </>
                ) : (
                  <EmptyProposals>
                    <TYPE.body color={theme.text3} textAlign="center">
                      No liquidity found.
                    </TYPE.body>
                  </EmptyProposals>
                )}
              </>
            )}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
