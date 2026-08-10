import { useAccount } from "wagmi";
import { Address } from "viem";
import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { IDerivedSwapInfo, useSwapState } from "@clmm/state/swapStore";
import { SwapField } from "@clmm/types/swap-field";
import { useNordsternQuote } from "./useNordsternQuote";
import { useSwapRoutePreference } from "@clmm/state/routePreferenceStore";

/**
 * Best-of comparison between the native Algebra trade and a Nordstern aggregator
 * quote for the current exact-input swap. Nordstern only does exact-input, so this
 * is skipped for exact-output and wraps. The quote hook is react-query-cached, so
 * calling this from several components (button, params, pair) dedupes the request.
 *
 * `isBetter` = Nordstern's output beats the native route's (same output token, raw
 * units), OR the native route doesn't exist but Nordstern does.
 */
export function useNordsternSwap(derivedSwap: IDerivedSwapInfo) {
    const { address } = useAccount();
    const { independentField } = useSwapState();
    const isExactIn = independentField === SwapField.INPUT;

    const inputCurrency = derivedSwap.currencies[SwapField.INPUT];
    const outputCurrency = derivedSwap.currencies[SwapField.OUTPUT];
    const parsedInput = derivedSwap.parsedAmount;

    const isWrap = Boolean(inputCurrency && outputCurrency && inputCurrency.wrapped.equals(outputCurrency.wrapped));
    const amountIn = isExactIn && parsedInput ? BigInt(parsedInput.quotient.toString()) : undefined;

    // allowedSlippage is a Percent (e.g. 0.5%); Nordstern wants a percent number.
    const slippage = Number(derivedSwap.allowedSlippage?.toFixed(2) ?? "0.5") || 0.5;

    const { data: quote, isLoading } = useNordsternQuote({
        chainId: DEFAULT_CHAIN_ID,
        tokenIn: inputCurrency?.wrapped.address as Address,
        tokenInIsNative: inputCurrency?.isNative,
        tokenOut: outputCurrency?.wrapped.address as Address,
        tokenOutIsNative: outputCurrency?.isNative,
        amountIn,
        from: address as Address,
        slippage,
        enabled: isExactIn && !isWrap,
    });

    const nativeTrade = derivedSwap.toggledTrade;
    const nativeOut = nativeTrade?.outputAmount ? BigInt(nativeTrade.outputAmount.quotient.toString()) : 0n;

    const hasNordstern = Boolean(quote);
    const hasNative = Boolean(nativeTrade);
    const isBetter = Boolean(quote && quote.toAmount > nativeOut);

    // Effective route after the user's preference. "auto" = best-of (Nordstern when
    // it wins or is the only route); otherwise honor the forced choice when possible.
    const { preferredRoute } = useSwapRoutePreference();
    const useNordstern =
        preferredRoute === "nordstern"
            ? hasNordstern
            : preferredRoute === "brownfi"
            ? false
            : hasNordstern && (isBetter || !hasNative); // auto

    return {
        quote,
        isBetter,
        useNordstern,
        hasNordstern,
        hasNative,
        isLoading,
        nativeOut,
        nordsternOut: quote?.toAmount ?? 0n,
        inputCurrency,
        outputCurrency,
        isExactIn,
        preferredRoute,
    };
}
