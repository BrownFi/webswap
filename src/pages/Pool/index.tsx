import { ChainId, JSBI, Pair, Token, TokenAmount, WETH } from '@brownfi/sdk'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'styled-components'

import SwitchVersion from 'components/SwitchVersion'
import { useVersion } from 'hooks/useVersion'
import { Address, checksumAddress } from 'viem'

import { AutoColumn } from 'components/Column'
import FullPositionCard from 'components/PositionCard'
import { Flex, Text } from 'components/Rebass'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { TYPE } from 'theme'

import { PairStats } from 'components/PositionCard/usePoolStats'
import { Dots } from 'components/swap/styleds'
import { isMainnet } from 'connectors'
import { useActiveWeb3React } from 'hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useQuery } from '@tanstack/react-query'
import { graphqlFetcher } from 'utils/graphql'
import { usePairs } from 'data/Reserves'
import { useStakingInfo } from 'state/stake/hooks'
import { BIG_INT_ZERO } from 'constants/common'
import { useDefaultTokens } from 'state/lists/hooks'
import { Modal } from 'components/Modal'
import { EmptyProposals, IndexerModalContent, PageWrapper, ResponsiveButtonPrimary, TitleRow } from './styleds'
import { ButtonPrimary } from 'components/Button'

const LIST_ALL_PAIRS = `
  query PairList($chainId: Int) {
    pairs {
      id
      fee
      protocolFee
      feeDay
      totalSupply
      reserve0
      reserve1
      tvl
      apr
      volumeDay
      volume7Day
      updatedAt
      token0 {
        id
        decimals
        name
        price
        priceFeedId
        symbol
        totalSupply
      }
      token1 {
        id
        decimals
        name
        price
        priceFeedId
        symbol
        totalSupply
      }
    }
  }
`

export default function Pool() {
  const { chainId } = useActiveWeb3React()
  const { version, enableGraphQL } = useVersion({ chainId })
  const allTokens = useDefaultTokens(chainId)

  const { data, error } = useQuery<{
    pairs: {
      id: string
      fee: number
      protocolFee: number
      feeDay: number
      totalSupply: number
      reserve0: number
      reserve1: number
      tvl: number
      apr: number
      volumeDay: number
      volume7Day: number
      updatedAt: number
      token0: {
        id: string
        decimals: number
        name: string
        price: number
        priceFeedId: string
        symbol: string
        totalSupply: number
      }
      token1: {
        id: string
        decimals: number
        name: string
        price: number
        priceFeedId: string
        symbol: string
        totalSupply: number
      }
    }[]
  }>({
    queryKey: ['pairList', chainId],
    queryFn: () =>
      graphqlFetcher({
        operationName: 'PairList',
        query: LIST_ALL_PAIRS,
        variables: { chainId },
      }),
    enabled: enableGraphQL,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })

  const sortedPairs = useMemo(
    () => (data?.pairs ?? []).slice().sort((pairA: PairStats, pairB: PairStats) => pairB.tvl - pairA.tvl),
    [data?.pairs],
  )

  const blocklist = useMemo(
    () =>
      new Set(
        [
          '0xFC5b86437A50e9B4ae0f20Ef9B50f8D79B053121', // WBERA/LBGT
          '0x5E9B2Cd773d8283B578Df77754DFcC2894e36b4D', // LBGT/HONEY
          '0x4EDE02365c2564422Ff3Fc297000fAb082453D7c', // USDC/USDT Linea
          '0x6b3987abbf550c4114918F78267F728d85A65dfd', // USDC/USDT Base
          '0xD4bAA274885F86717d70C1d5382F32499b11DE17', // AUSD/USDC Monad
        ].map((a) => a.toLowerCase()),
      ),
    [],
  )

  const allowedTokenAddresses = useMemo(() => {
    const wethAddress = WETH[chainId]?.address.toLowerCase()
    const set = new Set(allTokens.map((token) => token.address.toLowerCase()))
    if (wethAddress) set.add(wethAddress)
    return set
  }, [allTokens, chainId])

  // Filter pairs using GraphQL
  const filteredPairs = useMemo(
    () =>
      sortedPairs.filter((pair) => {
        if (isMainnet) {
          if (blocklist.has(pair.id.toLowerCase())) {
            return false
          }
          const token0Address = pair.token0?.id.toLowerCase()
          const token1Address = pair.token1?.id.toLowerCase()
          return allowedTokenAddresses.has(token0Address) || allowedTokenAddresses.has(token1Address)
        }
        return true
      }),
    [sortedPairs, blocklist, allowedTokenAddresses],
  )

  const shouldUseGraphQL = enableGraphQL && filteredPairs.length > 0
  const [showIndexerModal, setShowIndexerModal] = useState(false)

  const hasIndexerIssue =
    !!error || filteredPairs.some((pair) => pair.tvl > 1000 && pair.updatedAt < Date.now() / 1000 - 8 * 3600)

  useEffect(() => {
    if (hasIndexerIssue) {
      setShowIndexerModal(true)
    } else {
      setShowIndexerModal(false)
    }
  }, [hasIndexerIssue])

  const handleIndexerModalDismiss = () => setShowIndexerModal(false)

  return (
    <>
      <Modal isOpen={hasIndexerIssue && showIndexerModal} onDismiss={handleIndexerModalDismiss} maxWidth={480}>
        <IndexerModalContent>
          <TYPE.mediumHeader fontSize={16} fontWeight={600} color="white">
            Indexer is syncing
          </TYPE.mediumHeader>
          <TYPE.main fontSize={16} fontWeight={500} color="#f2dfc8" lineHeight="22px">
            Charts and portfolios are temporarily delayed while our indexer syncs with the blockchain. All other
            functions are operating normally and data will update shortly.
          </TYPE.main>
          <ButtonPrimary onClick={handleIndexerModalDismiss} className="!py-2">
            <Text fontWeight={700}>Got it</Text>
          </ButtonPrimary>
        </IndexerModalContent>
      </Modal>

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
                        checksumAddress(token0!.id as Address),
                        token0!.decimals,
                        token0?.symbol,
                        token0?.name,
                      ),
                      JSBI.BigInt(Math.round(item.reserve0 * 10 ** token0!.decimals)),
                    ),
                    new TokenAmount(
                      new Token(
                        chainId,
                        checksumAddress(token1!.id as Address),
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
                      key={checksumAddress(item.id as Address)}
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
  const stakingInfo = useStakingInfo(undefined, { disabled: true })
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
  )
}
