import { Currency, ExtendedNative, Token, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { NATIVE_NAME, NATIVE_SYMBOL } from "@clmm/config";
import { Address, isAddressEqual } from "viem";

export function unwrappedToken(token: Token | Currency | ExtendedNative): Currency | ExtendedNative {
    const chainId = token.chainId;
    const wrappedNative = WNATIVE[chainId];

    /* On a chain we don't know about (no WNATIVE entry) we can't tell whether
     * this token is the wrapped native, so just return it untouched. Without
     * this guard `wrappedNative.address` would throw and the whole pool /
     * position card unmounts. */
    if (!wrappedNative) return token;

    const isWrappedNative =
        "isToken" in token && token.isToken && isAddressEqual(token.address as Address, wrappedNative.address as Address);

    const isNative = "isToken" in token && token.isToken && isAddressEqual(token.address as Address, ADDRESS_ZERO);

    if (isWrappedNative || isNative) {
        return ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);
    }

    return token;
}
