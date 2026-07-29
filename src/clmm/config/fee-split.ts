import { Address } from "viem";

/**
 * Protocol/community-fee split (Hemi). Swap community fees accumulate in the
 * Algebra CommunityVault; on withdraw, Algebra takes its cut and the rest goes to
 * the FeeSplitter, which splits between BrownFi (receiver0) and Hemi (receiver1).
 *
 * Flow:  Vault.withdrawTokens()  →  FeeSplitter.claimAll(token) / claimAllNative()
 * Roles: withdraw = factory COMMUNITY_FEE_WITHDRAWER_ROLE / owner; claim = splitter whitelist.
 */
// Wallets that may see the /clmm/claim-fee nav entry (BrownFi + Hemi). Hardcoded so
// the navbar decides visibility from the connected address alone — no on-chain read
// on every render. Actual claim/withdraw actions are still enforced on-chain.
export const FEE_CLAIM_WALLETS: readonly string[] = [
    "0xbe9536bef1137915dcb047bb7a915ee9b0961de4", // BrownFi (receiver0 / owner)
    "0x068ab81292e8eefc97ab626ff4d94409d4e98528", // Hemi (receiver1)
];

export const isFeeClaimWallet = (addr?: string) => Boolean(addr) && FEE_CLAIM_WALLETS.includes(addr!.toLowerCase());

export const FEE_SPLITTER_ADDRESS = "0x745B18353cf9b67ECff2C21A7031DD83727895C3" as Address;
export const COMMUNITY_VAULT_ADDRESS = "0x4439199c3743161ca22bb8f8b6dec5bf6ff65b04" as Address;

// vault.COMMUNITY_FEE_WITHDRAWER_ROLE() — a constant, hardcoded to skip a read.
export const COMMUNITY_FEE_WITHDRAWER_ROLE = "0xb77a63f119f4dc2174dc6c76fc1a1565fa4f2b0dde50ed5c0465471cd9b331f6" as `0x${string}`;

export const feeSplitterAbi = [
    { type: "function", name: "receiver0", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
    { type: "function", name: "receiver1", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
    { type: "function", name: "receiver0Share", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
    { type: "function", name: "SHARE_DENOMINATOR", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
    { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
    {
        type: "function",
        name: "isWhitelistedClaimant",
        stateMutability: "view",
        inputs: [{ type: "address" }],
        outputs: [{ type: "bool" }],
    },
    { type: "function", name: "claimAll", stateMutability: "nonpayable", inputs: [{ type: "address" }], outputs: [] },
    { type: "function", name: "claimAllNative", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

export const communityVaultAbi = [
    {
        type: "function",
        name: "withdrawTokens",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "params",
                type: "tuple[]",
                components: [
                    { name: "token", type: "address" },
                    { name: "amount", type: "uint256" },
                ],
            },
        ],
        outputs: [],
    },
] as const;

export const factoryRoleAbi = [
    {
        type: "function",
        name: "hasRoleOrOwner",
        stateMutability: "view",
        inputs: [{ type: "bytes32" }, { type: "address" }],
        outputs: [{ type: "bool" }],
    },
    { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

export const erc20BalanceOfAbi = [
    { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
] as const;
