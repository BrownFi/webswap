import { ADDRESS_ZERO, WNATIVE, Token, computePoolAddress } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { algebraPoolABI } from "@clmm/config/abis";
import { TOKENS, DEFAULT_CHAIN_ID } from "@clmm/config";
import { FormattedPool } from "./useFormattedPools";
import { usePositions } from "../positions/usePositions";

/**
 * Discovers pools on-chain when no subgraph is configured. Computes addresses
 * via CREATE2 for every pair of known tokens (config TOKENS + wrapped native), then
 * reads each pool's state in a single multicall and keeps the initialized
 * ones with liquidity > 0.
 */
export function useOnchainPoolsList(tokenAddress?: Address): { pools: FormattedPool[]; isLoading: boolean } {
    const chainId = DEFAULT_CHAIN_ID;
    const { address: account } = useAccount();
    const { positions } = usePositions();

    /* Lowercased pool addresses where the user currently has any open position
     * (liquidity > 0). Used below to set isMyPool. */
    const myPoolAddresses = useMemo(() => {
        const set = new Set<string>();
        for (const p of positions ?? []) {
            if (p.liquidity > 0n) set.add(p.pool.toLowerCase());
        }
        return set;
    }, [positions]);

    const knownTokens = useMemo(() => {
        const map = new Map<string, Token>();
        const wbera = WNATIVE[chainId];
        if (wbera) map.set(wbera.address.toLowerCase(), wbera);
        const cfg = TOKENS[chainId] ?? {};
        for (const t of Object.values(cfg)) {
            map.set(t.address.toLowerCase(), t);
        }
        return [...map.values()];
    }, [chainId]);

    /* All unique unordered pairs of known tokens, plus their computed pool address. */
    const candidates = useMemo(() => {
        const out: { tokenA: Token; tokenB: Token; address: Address }[] = [];
        for (let i = 0; i < knownTokens.length; i++) {
            for (let j = i + 1; j < knownTokens.length; j++) {
                const tokenA = knownTokens[i];
                const tokenB = knownTokens[j];
                out.push({ tokenA, tokenB, address: computePoolAddress({ tokenA, tokenB }) as Address });
            }
        }
        return out;
    }, [knownTokens]);

    const calls = useMemo(() => {
        return candidates.flatMap(({ address }) => [
            { address, abi: algebraPoolABI, functionName: "globalState" },
            { address, abi: algebraPoolABI, functionName: "liquidity" },
        ]) as Parameters<typeof useReadContracts>[0]["contracts"];
    }, [candidates]);

    const { data, isLoading } = useReadContracts({
        contracts: calls,
        allowFailure: true,
        query: { enabled: calls.length > 0 },
    });

    const formatted = useMemo<FormattedPool[]>(() => {
        if (!data) return [];

        const pools: FormattedPool[] = [];
        for (let i = 0; i < candidates.length; i++) {
            const gs = data[i * 2];
            const liq = data[i * 2 + 1];
            if (gs?.status !== "success" || liq?.status !== "success") continue;

            const globalState = gs.result as readonly [bigint, number, number, number, number, boolean];

            const sqrtPrice = globalState[0];
            /* Only filter out pools that have never been initialized. Empty
             * (zero liquidity) pools should still appear so users can see them
             * and add the first position. */
            if (sqrtPrice === 0n) continue;

            const fee = Number(globalState[2]);
            const { tokenA, tokenB, address } = candidates[i];

            /* Sort tokens to match how the pool stores them so the UI shows pair order matching on-chain. */
            const [t0, t1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];

            if (
                tokenAddress &&
                t0.address.toLowerCase() !== tokenAddress.toLowerCase() &&
                t1.address.toLowerCase() !== tokenAddress.toLowerCase()
            ) {
                continue;
            }

            pools.push({
                id: address,
                pair: {
                    token0: {
                        id: t0.address as Address,
                        symbol: t0.symbol ?? "",
                        name: t0.name ?? "",
                        decimals: t0.decimals,
                        derivedMatic: 0,
                    },
                    token1: {
                        id: t1.address as Address,
                        symbol: t1.symbol ?? "",
                        name: t1.name ?? "",
                        decimals: t1.decimals,
                        derivedMatic: 0,
                    },
                },
                fee: fee / 10_000,
                tvlUSD: 0,
                volume24USD: 0,
                poolMaxApr: 0,
                poolAvgApr: 0,
                avgApr: 0,
                farmApr: 0,
                isMyPool: myPoolAddresses.has(address.toLowerCase()),
                hasActiveFarming: false,
                hasALM: false,
                deployer: ADDRESS_ZERO,
                isBoostedPool: false,
                isBoostedToken0: false,
                isBoostedToken1: false,
                isShowcase: false,
            });
        }
        return pools;
    }, [data, candidates, tokenAddress, account, myPoolAddresses]);

    return { pools: formatted, isLoading };
}
