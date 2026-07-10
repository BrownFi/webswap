import { DEFAULT_CHAIN_ID, INFO_GRAPH_URL, TOKENS } from "@clmm/config";
import { useNativePriceQuery, useSingleTokenQuery } from "@clmm/graphql/generated/graphql";
import { Currency, CurrencyAmount, Price, Token, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { useClients } from "../graphql/useClients";

export function useUSDCPrice(currency: Currency | undefined) {
    const { infoClient } = useClients();
    const chainId = DEFAULT_CHAIN_ID;
    const hasSubgraph = Boolean(INFO_GRAPH_URL[chainId ?? DEFAULT_CHAIN_ID]);

    const { data: bundles } = useNativePriceQuery({
        client: infoClient,
        skip: !hasSubgraph,
    });

    const { data: token } = useSingleTokenQuery({
        variables: {
            tokenId: currency ? currency.wrapped.address.toLowerCase() : "",
        },
        skip: !currency || !hasSubgraph,
        client: infoClient,
    });

    return useMemo(() => {
        if (!currency) {
            return {
                price: undefined,
                formatted: 0,
            };
        }

        // Optional USD-anchor token (e.g. USDC). Not every chain's curated list has one.
        const usdc = (TOKENS[chainId] as Record<string, Token | undefined>)?.USDC;

        // USDC itself — 1:1 price
        if (usdc && usdc.address.toLowerCase() === currency.wrapped.address.toLowerCase()) {
            return {
                price: new Price(usdc, usdc, "1", "1"),
                formatted: 1,
            };
        }

        let derivedMatic: string | undefined;
        let maticPriceUSD: number | undefined;

        if (bundles?.bundles?.[0] && token?.token?.derivedMatic) {
            maticPriceUSD = Number(bundles.bundles[0].maticPriceUSD);
            derivedMatic = token.token.derivedMatic;
        } else {
            return {
                price: undefined,
                formatted: 0,
            };
        }

        if (!derivedMatic || !maticPriceUSD) {
            return {
                price: undefined,
                formatted: 0,
            };
        }

        const tokenUSDValue = Number(derivedMatic) * maticPriceUSD;

        const usdAmount = tryParseAmount(tokenUSDValue.toFixed(currency.decimals), currency);

        if (usdAmount) {
            return {
                price: usdc ? new Price(currency, usdc, usdAmount.denominator, usdAmount.numerator) : undefined,
                formatted: Number(usdAmount.toSignificant()),
            };
        }

        return {
            price: undefined,
            formatted: 0,
        };
    }, [currency, bundles?.bundles, chainId, token?.token?.derivedMatic]);
}

export function useUSDCValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
    const { price, formatted } = useUSDCPrice(currencyAmount?.currency);

    return useMemo(() => {
        if (!price || !currencyAmount)
            return {
                price: null,
                formatted: null,
            };

        try {
            return {
                price: price.quote(currencyAmount),
                formatted: Number(currencyAmount.toSignificant()) * formatted,
            };
        } catch {
            return {
                price: null,
                formatted: null,
            };
        }
    }, [currencyAmount, price]);
}
