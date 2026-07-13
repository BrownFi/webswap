import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

export type PoolDeployerType = "BASE_DYNAMIC" | "BASE_03" | "BASE_1" | "ALL_INCLUSIVE";

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
    /* entryPoint address from BrownFi's Algebra hemi-deploys.json */
    ALL_INCLUSIVE: {
        [ChainId.Hemi]: "0xd3817f2F9Ef19f838175E9879686Bb2E60893343",
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
