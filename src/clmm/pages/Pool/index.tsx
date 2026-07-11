import PageContainer from "@clmm/components/common/PageContainer";
import MyPositions from "@clmm/components/pool/MyPositions";
import PoolHeader from "@clmm/components/pool/PoolHeader";
import PositionCard from "@clmm/components/position/PositionCard";
import { Button } from "@clmm/components/ui/button";
import { Skeleton } from "@clmm/components/ui/skeleton";
import { usePool, SecurityState } from "@clmm/hooks/pools/usePool";
import { useSecurityRegistryConfigured } from "@clmm/hooks/pools/useSecurityRegistryConfigured";
import { usePositions } from "@clmm/hooks/positions/usePositions";
import { FormattedPosition } from "@clmm/types/formatted-position";
import { getPositionAPR } from "@clmm/utils/positions/getPositionAPR";
import { getPositionFees } from "@clmm/utils/positions/getPositionFees";
import { formatAmount } from "@clmm/utils/common/formatAmount";
import { CurrencyAmount, ZERO } from "@cryptoalgebra/integral-sdk";
import { MoveRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import JSBI from "jsbi";
import { Address, parseUnits } from "viem";
import ALMModule from "@clmm/modules/ALMModule";
import FarmingModule from "@clmm/modules/FarmingModule";
import { createUncheckedPosition } from "@clmm/utils/positions/createUncheckedPosition";
import MyPositionsToolbar from "@clmm/components/pool/MyPositionsToolbar";
import { useAppKit } from "@reown/appkit/react";
import { unwrappedToken } from "@clmm/utils/common/unwrappedToken";
import { useUSDCPrice } from "@clmm/hooks/common/useUSDCValue";
import useSWR from "swr";
import { Deposit, useSinglePositionLazyQuery } from "@clmm/graphql/generated/graphql";
import { useReadSecurityRegistryGlobalStatus } from "@clmm/generated";
import { DEFAULT_CHAIN_ID, INFO_GRAPH_URL } from "@clmm/config";

const { ALMPositionCard } = ALMModule.components;
const { useUserALMVaultsByPool } = ALMModule.hooks;

const { ActiveFarming, UnclaimedRewards } = FarmingModule.components;
const { useActiveFarming, useClosedFarmings, useUnclaimedRewards } = FarmingModule.hooks;

const PoolPage = () => {
    const { address: account } = useAccount();

    const { pool: poolId } = useParams() as { pool: Address };

    const [, poolEntity, poolSecurityStatus] = usePool(poolId);

    const { formatted: token0PriceUSD } = useUSDCPrice(poolEntity?.token0);
    const { formatted: token1PriceUSD } = useUSDCPrice(poolEntity?.token1);

    const { positions, loading: positionsLoading } = usePositions();

    const { userVaults, isLoading: areUserVaultsLoading } = useUserALMVaultsByPool(poolId, account);

    const { farmingInfo, deposits, isFarmingLoading, areDepositsLoading } = useActiveFarming({
        poolId: poolId,
    });

    const { closedFarmings } = useClosedFarmings({
        poolId: poolId,
    });

    const { unclaimedRewards } = useUnclaimedRewards();

    const hasSecurityRegistry = useSecurityRegistryConfigured();
    const { data: rawGlobalStatus } = useReadSecurityRegistryGlobalStatus({
        query: { enabled: hasSecurityRegistry },
    });

    /* No registry deployed = open factory; default everything to ENABLED. */
    const globalStatus = hasSecurityRegistry ? rawGlobalStatus : SecurityState.ENABLED;
    const effectiveStatus = globalStatus !== SecurityState.ENABLED ? globalStatus : poolSecurityStatus;

    const filteredPositions = useMemo(() => {
        if (!positions || !poolEntity) return [];

        return positions
            .filter(({ pool }) => pool.toLowerCase() === poolId.toLowerCase())
            .map((position) => ({
                positionId: position.tokenId,
                position: createUncheckedPosition(
                    poolEntity,
                    position.liquidity.toString(),
                    Number(position.tickLower),
                    Number(position.tickUpper)
                ),
            }));
    }, [positions, poolEntity, poolId]);

    const chainId = DEFAULT_CHAIN_ID;
    const hasSubgraph = Boolean(INFO_GRAPH_URL[chainId ?? DEFAULT_CHAIN_ID]);

    const { data: positionsFees, isLoading: positionsFeesLoading } = useSWR(
        ["positionsFees", filteredPositions, account, effectiveStatus],
        async () => {
            if (!account) return [];

            return Promise.all(
                filteredPositions.map(async ({ positionId, position }) => {
                    if (JSBI.equal(position.liquidity, ZERO) || effectiveStatus !== SecurityState.ENABLED)
                        return [
                            CurrencyAmount.fromRawAmount(position.pool.token0, "0"),
                            CurrencyAmount.fromRawAmount(position.pool.token1, "0"),
                        ];

                    /* getPositionFees simulates NPM.collect(); for brand-new positions or
                     * positions with no accrued fees the simulation may revert. Return 0
                     * instead of letting it bubble up and hang the SWR fetcher. */
                    try {
                        return await getPositionFees(position.pool, positionId, account);
                    } catch {
                        return [
                            CurrencyAmount.fromRawAmount(position.pool.token0, "0"),
                            CurrencyAmount.fromRawAmount(position.pool.token1, "0"),
                        ];
                    }
                })
            );
        },
        {
            refreshInterval: 10000,
            keepPreviousData: true,
            shouldRetryOnError: false,
        }
    );

    const [getSinglePosition] = useSinglePositionLazyQuery();
    const { data: positionsAPRs, isLoading: positionsAPRsLoading } = useSWR(
        ["positionsAPRs", filteredPositions, positionsFees, token0PriceUSD, token1PriceUSD, effectiveStatus, hasSubgraph],
        async () => {
            if (!filteredPositions || !positionsFees) return [];
            /* APR needs subgraph-tracked mint-date + collectedFees history. With no
             * subgraph, return zeros immediately so the page can render. */
            if (!hasSubgraph) return filteredPositions.map(() => 0);

            const positionsAPRs = await Promise.all(
                filteredPositions.map(async ({ positionId, position }, idx) => {
                    if (JSBI.equal(position.liquidity, ZERO) || effectiveStatus !== SecurityState.ENABLED) return 0;

                    const result = await getSinglePosition({ variables: { tokenId: positionId.toString() } });
                    const singlePosition = result?.data?.position;
                    if (!singlePosition) return 0;

                    const { token0, token1 } = position.pool;
                    const { collectedFeesToken0, collectedFeesToken1 } = singlePosition;

                    return getPositionAPR(
                        position.amount0,
                        position.amount1,
                        positionsFees[idx][0],
                        positionsFees[idx][1],
                        CurrencyAmount.fromRawAmount(token0, parseUnits(collectedFeesToken0, token0.decimals).toString()),
                        CurrencyAmount.fromRawAmount(token1, parseUnits(collectedFeesToken1, token1.decimals).toString()),
                        position.pool.token0Price,
                        new Date(Number(singlePosition.transaction.timestamp) * 1000).getTime()
                    );
                })
            );

            return positionsAPRs;
        },
        { shouldRetryOnError: false }
    );

    const positionsData = useMemo(() => {
        if (!filteredPositions || !poolEntity || !positionsFees || !positionsAPRs) return [];

        const positionsData = filteredPositions.map(({ positionId, position }, idx) => {
            const currentPositionInFarming = deposits?.deposits?.find((deposit) => Number(deposit.id) === Number(positionId));
            const range = `${formatAmount(position.token0PriceLower.toFixed(6), 6)} — ${formatAmount(
                position.token0PriceUpper.toFixed(6),
                6
            )}`;
            const rangeLength = Number(position.tickUpper) - Number(position.tickLower);

            const amount0USD = Number(position.amount0.toSignificant(24)) * token0PriceUSD;
            const amount1USD = Number(position.amount1.toSignificant(24)) * token1PriceUSD;
            const liquidityUSD = amount0USD + amount1USD;

            /* positionsFees and positionsAPRs may lag behind filteredPositions when SWR
             * uses keepPreviousData (e.g. just after a new position is minted). Treat
             * missing entries as zero so the UI renders rather than throwing. */
            const fee0 = positionsFees[idx]?.[0];
            const fee1 = positionsFees[idx]?.[1];
            const fees0USD = fee0 ? Number(fee0.toSignificant()) * token0PriceUSD : 0;
            const fees1USD = fee1 ? Number(fee1.toSignificant()) * token1PriceUSD : 0;
            const feesUSD = fees0USD + fees1USD;

            const apr = positionsAPRs[idx] ?? 0;

            return {
                id: positionId.toString(),
                isClosed: JSBI.EQ(position.liquidity, ZERO),
                outOfRange: poolEntity.tickCurrent < position.tickLower || poolEntity.tickCurrent > position.tickUpper,
                range,
                liquidityUSD,
                feesUSD,
                apr,
                onFarming: Boolean(currentPositionInFarming?.eternalFarming),
                rangeLength,
                position,
                isALM: false,
                almShares: null,
                almVaultAddress: null,
            } as FormattedPosition;
        });

        const almPositionsData =
            userVaults?.map(
                (vault) =>
                    ({
                        id: `${vault.vault.name}${vault.onFarming ? "-F" : ""}`,
                        isALM: true,
                        isClosed: false,
                        outOfRange: false,
                        range: "ALM Managed",
                        liquidityUSD: vault.amountsUsd,
                        feesUSD: null,
                        apr: Math.abs(vault.vault.apr),
                        onFarming: vault.onFarming,
                        rangeLength: 0,
                        position: null,
                        almShares: vault.shares,
                        almVaultAddress: vault.vault.id,
                    } as FormattedPosition)
            ) || [];

        return [...almPositionsData, ...positionsData];
    }, [filteredPositions, poolEntity, positionsFees, positionsAPRs, userVaults, deposits?.deposits, token0PriceUSD, token1PriceUSD]);

    const [selectedPosition, setSelectedPosition] = useState<FormattedPosition | null>(null);

    const noPositions = positionsData.length === 0 && (userVaults?.length === 0 || !userVaults) && poolEntity;

    const isLoading =
        (positionsLoading ||
            isFarmingLoading ||
            areDepositsLoading ||
            areUserVaultsLoading ||
            positionsFeesLoading ||
            positionsAPRsLoading) &&
        noPositions;

    return (
        <PageContainer>
            <PoolHeader pool={poolEntity} showCreatePosition={effectiveStatus === SecurityState.ENABLED} />

            <div className="flex items-center justify-between mt-6 mb-3">
                <h2
                    className="text-xl sm:text-2xl text-text-100"
                    style={{ fontFamily: "Inter", fontWeight: 600, letterSpacing: "-0.01em" }}
                >
                    Your positions
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-3 md:gap-3 w-full">
                <div className="col-span-2">
                    <MyPositionsToolbar
                        currencyA={poolEntity && unwrappedToken(poolEntity.token0)}
                        currencyB={poolEntity && unwrappedToken(poolEntity.token1)}
                        positionsData={positionsData}
                        poolStatus={effectiveStatus}
                    />
                    {!account ? (
                        <NoAccount />
                    ) : isLoading ? (
                        <LoadingState />
                    ) : noPositions ? (
                        effectiveStatus === SecurityState.ENABLED ?
                        <NoPositions poolId={poolId} /> :
                        null
                    ) : (
                        <>
                            <MyPositions
                                positions={positionsData}
                                poolId={poolId}
                                selectedPosition={selectedPosition?.id}
                                selectPosition={(position) => setSelectedPosition(position)}
                            />
                            {unclaimedRewards && Boolean(unclaimedRewards?.rewards?.length) && effectiveStatus === SecurityState.ENABLED && (
                                <UnclaimedRewards unclaimedRewards={unclaimedRewards && unclaimedRewards.rewards} />
                            )}
                        </>
                    )}
                    {farmingInfo && !isFarmingLoading && !areDepositsLoading && effectiveStatus === SecurityState.ENABLED && (
                        <ActiveFarming
                            deposits={(deposits?.deposits as Deposit[]) || []}
                            farming={farmingInfo}
                            positionsData={positionsData}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-8 w-full h-full">
                    <PositionCard
                        pool={poolEntity}
                        farming={farmingInfo}
                        closedFarmings={closedFarmings}
                        selectedPosition={selectedPosition?.isALM ? null : selectedPosition}
                        poolStatus={effectiveStatus}
                    />
                    <ALMPositionCard
                        farming={farmingInfo}
                        poolAddress={poolId}
                        userVault={userVaults?.find(
                            (v) => v.vault.id === selectedPosition?.almVaultAddress && v.shares === selectedPosition?.almShares
                        )}
                        poolStatus={effectiveStatus}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

const NoPositions = ({ poolId }: { poolId: Address }) => (
    <div className="flex flex-col items-start justify-center gap-4 p-6 min-h-[377px] bg-card border border-card-border rounded-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-left">You don't have positions for this pool</h2>
        <p className="text-md font-semibold">Let's create one!</p>
        <Button variant={"primary"} className="gap-2" asChild>
            <Link to={`/clmm/pool/${poolId}/new-position`}>
                Create Position
                <MoveRightIcon />
            </Link>
        </Button>
    </div>
);

const NoAccount = () => {
    const { open } = useAppKit();

    return (
        <div className="flex flex-col items-start justify-center p-6 min-h-[377px] bg-card border border-card-border rounded-xl animate-fade-in">
            <h2 className="text-2xl font-bold">Connect Wallet</h2>
            <p className="text-md font-semibold my-4">Connect your account to view or create positions</p>
            <Button variant={"primary"} size={"lg"} onClick={() => open()}>
                Connect Wallet
            </Button>
        </div>
    );
};

// Mirror MyPositions' container (min-h-[377px], same bg/border/radius) so the
// positions area reserves the same space while loading — no shift when data lands.
const LoadingState = () => (
    <div className="flex flex-col min-h-[377px] pb-8 gap-4 p-4 bg-card border border-card-border/60 rounded-xl">
        {[1, 2, 3].map((v) => (
            <Skeleton key={`position-skeleton-${v}`} className="w-full h-[72px] bg-card-light rounded-xl" />
        ))}
    </div>
);

export default PoolPage;
