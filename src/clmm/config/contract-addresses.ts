import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core (BrownFi fork on Hemi — from /Users/jackson/brownfi/Algebra/hemi-deploys.json) */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.Hemi]: "0x797691C82093Fe9EfAD6ceAcB1FC3080C2a4F85A",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.Hemi]: "0x0Ee7e388564f3efEe06eF9A6f43C6E854AeC027e",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.Hemi]: "0x0194CcfC49C3ebc7457E0b41B9c6b840C22f5985",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.Hemi]: "0x97B4FE94Bf06dB1DE2b05425303965f3F95186c7",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.Hemi]: "0xA4C1B2cc90D455437E096E6473890906dc1C8499",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.Hemi]: "0x123AE7196548ED7370854F91f153cd4e5918A011",
};

/* Limit Orders — not deployed on Hemi yet */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};

/* Omega Router — not deployed on Hemi yet */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.Hemi]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 — not deployed on Hemi yet */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};
export const VOTER: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.Hemi]: ADDRESS_ZERO,
};
