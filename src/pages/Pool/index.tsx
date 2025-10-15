import { ChainId, JSBI, Pair, Token, TokenAmount } from '@brownfi/sdk'
import { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'

import SwitchVersion from 'components/SwitchVersion'
import { useVersion } from 'hooks/useVersion'
import { Address, checksumAddress } from 'viem'

import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import FullPositionCard from 'components/PositionCard'
import { RowBetween } from 'components/Row'
import { Flex, Text } from 'rebass'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { TYPE } from 'theme'

import { PairStats } from 'components/PositionCard/usePoolStats'
import { Dots } from 'components/swap/styleds'
import { isMainnet } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import useSWR from 'swr'
import { graphqlFetcher } from 'utils/swr'
import { internalService } from 'services'
import { parseFixed } from '@ethersproject/bignumber'

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

const LIST_ALL_PAIRS = `
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
`

export default function Pool() {
  const { chainId } = useActiveWeb3React()
  const { version, enableGraphQL } = useVersion({ chainId })

  const { data } = useSWR<{
    pairs: {
      totalCount: number
      items: {
        chainId: number
        address: string
        fee: number
        totalSupply: number
        reserve0: number
        reserve1: number
        tvl: number
        apr: number
        volumeDay: number
        volume7Day: number
        updatedAt: number
        token0: {
          chainId: number
          address: string
          decimals: number
          name: string
          price: number
          priceFeedId: string
          symbol: string
          totalSupply: number
        }
        token1: {
          chainId: number
          address: string
          decimals: number
          name: string
          price: number
          priceFeedId: string
          symbol: string
          totalSupply: number
        }
      }[]
    }
  }>(
    enableGraphQL ? [chainId] : null,
    ([chainId]) =>
      graphqlFetcher({
        operationName: 'PairList',
        query: LIST_ALL_PAIRS,
        variables: { chainId },
      }),
    {
      refreshInterval: 1 * 60 * 1000,
      refreshWhenHidden: true,
    },
  )

  const sortedPairs = (data?.pairs.items ?? [])
    .slice()
    .sort((pairA: PairStats, pairB: PairStats) => pairB.tvl - pairA.tvl)

  // Filter pairs using GraphQL
  const filteredPairs = sortedPairs.filter((pair) => {
    const symbol = `${pair.token0?.symbol}/${pair.token1?.symbol}`
    // console.log('symbol', symbol)
    if (isMainnet) {
      if (pair.chainId === ChainId.ARBITRUM_MAINNET) {
        return !['WBTC/WETH', 'WETH/USD₮0'].includes(symbol)
      }
      if (pair.chainId === ChainId.BSC_MAINNET) {
        // return !['USDC/WBNB', 'USDT/WBNB', 'USDT/BTCB'].includes(symbol)
      }
      if (pair.chainId === ChainId.BASE_MAINNET) {
        return !['USDC/cbBTC'].includes(symbol)
      }
      if (pair.chainId === ChainId.HYPER_EVM) {
        return !['USD₮0/kHYPE'].includes(symbol)
      }
    }
    return true
  })

  const shouldUseGraphQL = enableGraphQL && filteredPairs.length > 0

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

            {shouldUseGraphQL ? (
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
              <OnChainLiquidityPositions />
            )}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}

function OnChainLiquidityPositions() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()
  const { version } = useVersion({ chainId })

  const trackedTokenPairs = useTrackedTokenPairs()

  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens, version), tokens })),
    [trackedTokenPairs, version],
  )

  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])

  const [tokenBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  )

  const liquidityTokenAddresses = useMemo(() => liquidityTokens.map((token) => token.address.toLowerCase()), [
    liquidityTokens,
  ])

  const shouldFetchPoolStats = liquidityTokenAddresses.length > 0 && !!chainId

  const { data: poolStatsMap, isValidating: poolStatsLoading } = useSWR(
    shouldFetchPoolStats ? ['pool-stats', chainId, liquidityTokenAddresses.join(',')] : null,
    async ([, , addressesJoined]) => {
      const addresses = (addressesJoined as string).split(',').filter(Boolean)
      const entries = await Promise.all(
        addresses.map(async (address) => {
          try {
            const stats = await internalService.getPoolStats(address)
            return [address, stats] as const
          } catch (error) {
            console.error('Failed to fetch pool stats', address, error)
            return [address, null] as const
          }
        }),
      )
      return Object.fromEntries(entries)
    },
    {
      refreshInterval: 60 * 1000,
      revalidateOnFocus: false,
    },
  )

  const apiPairsWithBalance = useMemo(() => {
    if (!poolStatsMap) {
      return []
    }

    return tokenPairsWithLiquidityTokens
      .map(({ liquidityToken, tokens }) => {
        const [tokenA, tokenB] = tokens
        const stats = poolStatsMap[liquidityToken.address.toLowerCase()]
        const balance = tokenBalances[liquidityToken.address]

        if (!tokenA || !tokenB || !stats || !balance || !JSBI.greaterThan(balance.raw, JSBI.BigInt(0))) {
          return null
        }

        try {
          const reserve0Raw = parseFixed(stats.amountToken0?.toString() ?? '0', tokenA.decimals)
          const reserve1Raw = parseFixed(stats.amountToken1?.toString() ?? '0', tokenB.decimals)

          const pair = new Pair(
            new TokenAmount(tokenA, JSBI.BigInt(reserve0Raw.toString())),
            new TokenAmount(tokenB, JSBI.BigInt(reserve1Raw.toString())),
            version,
          )

          return { pair, liquidityTokenAddress: liquidityToken.address }
        } catch (error) {
          console.error('Failed to build pair from stats', liquidityToken.address, error)
          return null
        }
      })
      .filter((value): value is { pair: Pair; liquidityTokenAddress: string } => Boolean(value))
  }, [poolStatsMap, tokenPairsWithLiquidityTokens, tokenBalances, version])

  const isLoading = fetchingV2PairBalances || poolStatsLoading || (shouldFetchPoolStats && !poolStatsMap)

  if (isLoading) {
    return (
      <EmptyProposals>
        <TYPE.body color={theme.text3} textAlign="center">
          <Dots>Loading</Dots>
        </TYPE.body>
      </EmptyProposals>
    )
  }

  if (apiPairsWithBalance.length > 0) {
    return (
      <>
        {apiPairsWithBalance.map(({ pair, liquidityTokenAddress }) => (
          <FullPositionCard key={liquidityTokenAddress} pair={pair} />
        ))}
      </>
    )
  }

  return (
    <EmptyProposals>
      <TYPE.body color={theme.text3} textAlign="center">
        No liquidity found.
      </TYPE.body>
    </EmptyProposals>
  )
}
