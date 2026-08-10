import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

export type PoolDeployerType = "BASE_DYNAMIC" | "BASE_03" | "BASE_1" | "ALL_INCLUSIVE";

/* Integral 1.2.2 uses the plugin-based dynamic-fee model: BASE_DYNAMIC pools are
 * standard pools (ADDRESS_ZERO custom deployer) with a dynamic-fee plugin. The
 * old ALL_INCLUSIVE custom-pool deployer is not part of this deployment (the new
 * EntryPoint is 0xFe3BEcd7…, a different role), so it's null — CreatePoolForm
 * still references the key, so we keep it defined rather than removed. */
export const CUSTOM_POOL_DEPLOYER_ADDRESSES: Record<PoolDeployerType, Record<number, Address | null>> = {
    BASE_DYNAMIC: {
        [ChainId.Hemi]: ADDRESS_ZERO,
    },
    BASE_03: {
        [ChainId.Hemi]: null,
    },
    BASE_1: {
        [ChainId.Hemi]: null,
    },
    ALL_INCLUSIVE: {
        [ChainId.Hemi]: null,
    },
} as const;

export const CUSTOM_POOL_DEPLOYER_TITLES: Record<PoolDeployerType, string> = {
    BASE_DYNAMIC: "Dynamic",
    BASE_03: "0.3%",
    BASE_1: "1%",
    ALL_INCLUSIVE: "All-inclusive",
} as const;

export const customPoolDeployerTitleByAddress: Record<Address, string> = Object.fromEntries(
    Object.entries(CUSTOM_POOL_DEPLOYER_ADDRESSES).flatMap(([key, chainMap]) =>
        Object.values(chainMap).map((address) => [
            address?.toLowerCase(),
            CUSTOM_POOL_DEPLOYER_TITLES[key as keyof typeof CUSTOM_POOL_DEPLOYER_TITLES],
        ])
    )
);
