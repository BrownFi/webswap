import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID, SECURITY_REGISTRY } from "@clmm/config";
import { useChainId } from "wagmi";

/**
 * Returns true when a real (non-zero) SecurityRegistry contract is configured
 * for the active chain. When false, every security-status gate should default
 * to "ENABLED" — there is no on-chain registry to consult, so the FE shouldn't
 * block actions.
 */
export function useSecurityRegistryConfigured(): boolean {
    const chainId = useChainId();
    const address = SECURITY_REGISTRY[chainId ?? DEFAULT_CHAIN_ID];
    return Boolean(address) && address !== ADDRESS_ZERO;
}
