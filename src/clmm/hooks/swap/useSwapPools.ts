import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { ADDRESS_ZERO, Currency, Pool, computeCustomPoolAddress, computePoolAddress } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useAllCurrencyCombinations } from "./useAllCurrencyCombinations";

import { useMultiplePoolsQuery } from "@clmm/graphql/generated/graphql";
import { useClients } from "../graphql/useClients";
import { CUSTOM_POOL_DEPLOYER_ADDRESSES } from "@clmm/config/custom-pool-deployer";
import { INFO_GRAPH_URL } from "@clmm/config";
import useSWR from "swr";
import { tryCreateBoostedToken } from "@clmm/utils/token/tryCreateBoostedToken";
import { isDefined } from "@clmm/utils";
import { useReadContracts } from "wagmi";
import { algebraPoolABI } from "@clmm/config/abis";
import { erc20Abi } from "viem";

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useSwapPools(
    currencyIn?: Currency,
    currencyOut?: Currency
): {
    pools: Pool[];
    isLoading: boolean;
} {
    const chainId = DEFAULT_CHAIN_ID;
    const hasSubgraph = Boolean(INFO_GRAPH_URL[chainId]);

    const allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut);

    const { infoClient } = useClients();

    const poolsAddresses = useMemo(() => {
        const customPoolDeployerAddresses = Object.values(CUSTOM_POOL_DEPLOYER_ADDRESSES)
            .map((p) => p[chainId])
            .filter((p) => p !== ADDRESS_ZERO);

        const basePoolAddresses = allCurrencyCombinations.map(([tokenA, tokenB]) => computePoolAddress({ tokenA, tokenB }));

        const customPoolAddresses = allCurrencyCombinations.flatMap(([tokenA, tokenB]) =>
            customPoolDeployerAddresses.filter(isDefined).map((customPoolDeployer) =>
                computeCustomPoolAddress({
                    tokenA,
                    tokenB,
                    customPoolDeployer,
                })
            )
        );

        return [...basePoolAddresses, ...customPoolAddresses];
    }, [allCurrencyCombinations, chainId]);

    /* --- Subgraph path (preferred when available) --- */
    const { data: poolsData } = useMultiplePoolsQuery({
        client: infoClient,
        variables: {
            poolIds: poolsAddresses.map((address) => address.toLowerCase()),
        },
        skip: !hasSubgraph,
    });

    const { data: subgraphPools, isLoading: isSubgraphLoading } = useSWR(
        hasSubgraph ? ["swapPools", poolsData] : null,
        () => {
            if (!poolsData?.pools) return;

            return poolsData.pools
                .map((pool) => {
                    if (pool.liquidity === "0") return null;

                    const token0 = tryCreateBoostedToken(
                        chainId,
                        pool.token0.id,
                        Number(pool.token0.decimals),
                        pool.token0.symbol,
                        pool.token0.name
                    );
                    const token1 = tryCreateBoostedToken(
                        chainId,
                        pool.token1.id,
                        Number(pool.token1.decimals),
                        pool.token1.symbol,
                        pool.token1.name
                    );

                    return new Pool(
                        token0,
                        token1,
                        Number(pool.fee),
                        pool.sqrtPrice,
                        pool.deployer,
                        pool.liquidity,
                        Number(pool.tick),
                        Number(pool.tickSpacing)
                    );
                })
                .filter(isDefined);
        }
    );

    /* --- On-chain fallback (when subgraph isn't configured) --- */
    const onchainCalls = useMemo(() => {
        if (hasSubgraph) return [];
        return poolsAddresses.flatMap((address) => [
            { address, abi: algebraPoolABI, functionName: "globalState" },
            { address, abi: algebraPoolABI, functionName: "liquidity" },
            { address, abi: algebraPoolABI, functionName: "tickSpacing" },
            { address, abi: algebraPoolABI, functionName: "token0" },
            { address, abi: algebraPoolABI, functionName: "token1" },
        ]) as Parameters<typeof useReadContracts>[0]["contracts"];
    }, [hasSubgraph, poolsAddresses]);

    const { data: onchainData, isLoading: isOnchainLoading } = useReadContracts({
        contracts: onchainCalls,
        allowFailure: true,
        query: { enabled: !hasSubgraph && onchainCalls.length > 0 },
    });

    /* Collect unique token addresses from pool state, then fetch ERC20 decimals/symbol via a 2nd multicall. */
    const uniqueTokenAddresses = useMemo(() => {
        if (hasSubgraph || !onchainData) return [] as `0x${string}`[];
        const set = new Set<string>();
        for (let i = 0; i < poolsAddresses.length; i++) {
            const base = i * 5;
            const token0Res = onchainData[base + 3];
            const token1Res = onchainData[base + 4];
            if (token0Res?.status === "success") set.add((token0Res.result as string).toLowerCase());
            if (token1Res?.status === "success") set.add((token1Res.result as string).toLowerCase());
        }
        return [...set] as `0x${string}`[];
    }, [hasSubgraph, onchainData, poolsAddresses]);

    const tokenMetaCalls = useMemo(() => {
        if (hasSubgraph || uniqueTokenAddresses.length === 0) return [];
        return uniqueTokenAddresses.flatMap((address) => [
            { address, abi: erc20Abi, functionName: "decimals" },
            { address, abi: erc20Abi, functionName: "symbol" },
        ]) as Parameters<typeof useReadContracts>[0]["contracts"];
    }, [hasSubgraph, uniqueTokenAddresses]);

    const { data: tokenMetaData, isLoading: isTokenMetaLoading } = useReadContracts({
        contracts: tokenMetaCalls,
        allowFailure: true,
        query: { enabled: !hasSubgraph && tokenMetaCalls.length > 0 },
    });

    const tokenMetaByAddress = useMemo(() => {
        const map = new Map<string, { decimals: number; symbol: string }>();
        if (hasSubgraph || !tokenMetaData) return map;
        for (let i = 0; i < uniqueTokenAddresses.length; i++) {
            const decRes = tokenMetaData[i * 2];
            const symRes = tokenMetaData[i * 2 + 1];
            const decimals = decRes?.status === "success" ? Number(decRes.result) : 18;
            const symbol = symRes?.status === "success" ? String(symRes.result) : "";
            map.set(uniqueTokenAddresses[i].toLowerCase(), { decimals, symbol });
        }
        return map;
    }, [hasSubgraph, tokenMetaData, uniqueTokenAddresses]);

    const onchainPools = useMemo(() => {
        if (hasSubgraph || !onchainData) return undefined;

        const pools: Pool[] = [];
        for (let i = 0; i < poolsAddresses.length; i++) {
            const base = i * 5;
            const globalStateRes = onchainData[base];
            const liquidityRes = onchainData[base + 1];
            const tickSpacingRes = onchainData[base + 2];
            const token0Res = onchainData[base + 3];
            const token1Res = onchainData[base + 4];

            if (
                globalStateRes?.status !== "success" ||
                liquidityRes?.status !== "success" ||
                tickSpacingRes?.status !== "success" ||
                token0Res?.status !== "success" ||
                token1Res?.status !== "success"
            ) {
                continue;
            }

            const globalState = globalStateRes.result as readonly [bigint, number, number, number, number, number, boolean];
            const liquidity = liquidityRes.result as bigint;
            const tickSpacing = tickSpacingRes.result as number;
            const token0Address = token0Res.result as `0x${string}`;
            const token1Address = token1Res.result as `0x${string}`;

            const sqrtPrice = globalState[0];
            if (sqrtPrice === 0n || liquidity === 0n) continue; // uninitialized / empty pool

            const tick = Number(globalState[1]);
            const fee = Number(globalState[2]);

            const meta0 = tokenMetaByAddress.get(token0Address.toLowerCase()) ?? { decimals: 18, symbol: "" };
            const meta1 = tokenMetaByAddress.get(token1Address.toLowerCase()) ?? { decimals: 18, symbol: "" };

            const token0 = tryCreateBoostedToken(chainId, token0Address, meta0.decimals, meta0.symbol, meta0.symbol);
            const token1 = tryCreateBoostedToken(chainId, token1Address, meta1.decimals, meta1.symbol, meta1.symbol);

            try {
                pools.push(
                    new Pool(token0, token1, fee, sqrtPrice.toString(), ADDRESS_ZERO, liquidity.toString(), tick, tickSpacing)
                );
            } catch {
                // skip invalid pools
            }
        }
        return pools;
    }, [hasSubgraph, onchainData, poolsAddresses, chainId, tokenMetaByAddress]);

    return {
        pools: (hasSubgraph ? subgraphPools : onchainPools) || [],
        isLoading: hasSubgraph ? isSubgraphLoading : isOnchainLoading || isTokenMetaLoading,
    };
}
