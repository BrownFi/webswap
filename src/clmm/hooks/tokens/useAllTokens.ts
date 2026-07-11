import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { INFO_GRAPH_URL, NATIVE_NAME, NATIVE_SYMBOL, TOKENS } from "@clmm/config";
import { TokenFieldsFragment, useAllTokensQuery } from "@clmm/graphql/generated/graphql";
import { useTokensState } from "@clmm/state/tokensStore";
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address } from "viem";

import { useClients } from "../graphql/useClients";

export function useAllTokens(showNativeToken: boolean = true) {
    const chainId = DEFAULT_CHAIN_ID;

    const { infoClient } = useClients();
    const hasSubgraph = Boolean(INFO_GRAPH_URL[chainId]);

    const { data: allTokens, loading } = useAllTokensQuery({
        client: infoClient,
        skip: !hasSubgraph,
    });

    const { importedTokens } = useTokensState();

    const tokensBlackList: Address[] = useMemo(() => [], []);

    const mergedTokens = useMemo(() => {
        const tokens = new Map<Address, TokenFieldsFragment>();

        if (showNativeToken)
            tokens.set(ADDRESS_ZERO, {
                id: ADDRESS_ZERO,
                symbol: NATIVE_SYMBOL[chainId],
                name: NATIVE_NAME[chainId],
                decimals: 18,
                derivedMatic: 1,
            });

        // Static base list from config — used always so the selector is never empty when the subgraph is down.
        for (const token of Object.values(TOKENS[chainId] || {})) {
            tokens.set(token.address.toLowerCase() as Address, {
                id: token.address as Address,
                symbol: token.symbol ?? "",
                name: token.name ?? "",
                decimals: token.decimals,
                derivedMatic: 0,
            });
        }

        if (allTokens) {
            for (const token of allTokens.tokens.filter((token) => !tokensBlackList.includes(token.id as Address))) {
                tokens.set(token.id.toLowerCase() as Address, { ...token });
            }
        }

        const _importedTokens = Object.values(importedTokens[chainId] || []);

        for (const token of _importedTokens) {
            tokens.set(token.id.toLowerCase() as Address, {
                ...token,
                derivedMatic: 0,
            });
        }

        return [...tokens].map(([, token]) => ({ ...token }));
    }, [allTokens, importedTokens, tokensBlackList, chainId, showNativeToken]);

    return useMemo(
        () => ({
            tokens: mergedTokens,
            isLoading: hasSubgraph ? loading || Boolean(allTokens && !mergedTokens.length) : false,
        }),
        [mergedTokens, allTokens, loading, hasSubgraph]
    );
}
