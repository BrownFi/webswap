import { Currency, ExtendedNative, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID, NATIVE_NAME, NATIVE_SYMBOL } from "@clmm/config";
import { useAlgebraToken } from "./useAlgebraToken";
import { Address } from "viem";

export function useCurrency(address: Address | undefined, asNative: boolean = true): Currency | ExtendedNative | undefined {
    // CLMM is Hemi-only; always resolve on Hemi so a wallet chain switch (which
    // briefly re-renders CLMM with a non-Hemi chainId) can't read an undefined
    // WNATIVE[chainId] and crash.
    const chainId = DEFAULT_CHAIN_ID;
    const isWNative = address?.toLowerCase() === WNATIVE[chainId]?.address.toLowerCase();

    const isNative = address === ADDRESS_ZERO;

    const token = useAlgebraToken(isNative ? ADDRESS_ZERO : address, chainId);

    const extendedEther = ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);

    if (asNative) return isNative || isWNative ? extendedEther : token;

    if (isWNative) return extendedEther.wrapped;

    return isNative ? extendedEther : token;
}
