import { useMemo, useState } from "react";
import { useAccount, useBalance, useReadContracts, useWriteContract } from "wagmi";
import { Address, formatUnits } from "viem";
import { DEFAULT_CHAIN_ID, TOKENS } from "@clmm/config";
import { algebraFactoryAddress } from "@clmm/generated";
import {
    COMMUNITY_FEE_WITHDRAWER_ROLE,
    COMMUNITY_VAULT_ADDRESS,
    FEE_SPLITTER_ADDRESS,
    communityVaultAbi,
    erc20BalanceOfAbi,
    factoryRoleAbi,
    feeSplitterAbi,
} from "@clmm/config/fee-split";
import { useTransactionAwait } from "@clmm/hooks/common/useTransactionAwait";
import { TransactionType } from "@clmm/state/pendingTransactionsStore";
import { Button } from "@clmm/components/ui/button";
import PageContainer from "@clmm/components/common/PageContainer";
import PageTitle from "@clmm/components/common/PageTitle";
import CurrencyLogo from "@clmm/components/common/CurrencyLogo";
import { useCurrency } from "@clmm/hooks/common/useCurrency";
import { formatAmount } from "@clmm/utils";
import Loader from "@clmm/components/common/Loader";

const chainId = DEFAULT_CHAIN_ID;
const FACTORY = algebraFactoryAddress[chainId as keyof typeof algebraFactoryAddress] as Address;

const eq = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

function TokenRow({
    token,
    vaultBal,
    splitterBal,
    canClaim,
    onClaim,
    claiming,
}: {
    token: { address: string; symbol: string; decimals: number };
    vaultBal: bigint;
    splitterBal: bigint;
    canClaim: boolean;
    onClaim: () => void;
    claiming: boolean;
}) {
    const currency = useCurrency(token.address as Address, true);
    const fmt = (v: bigint) => formatAmount(formatUnits(v, token.decimals), 6);

    return (
        <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-2 px-4 py-3 border-t border-card-border text-sm">
            <div className="flex items-center gap-2 font-medium">
                {currency && <CurrencyLogo currency={currency} size={24} />}
                <span>{token.symbol}</span>
            </div>
            <div className="text-text-200">{fmt(vaultBal)}</div>
            <div className="font-semibold">{fmt(splitterBal)}</div>
            <div className="text-right">
                <Button
                    variant="primary"
                    className="px-4 py-1.5 rounded-lg text-xs"
                    disabled={!canClaim || splitterBal === 0n || claiming}
                    onClick={onClaim}
                >
                    {claiming ? <Loader size={14} /> : "Claim"}
                </Button>
            </div>
        </div>
    );
}

const ClaimFeePage = () => {
    const { address, isConnected } = useAccount();

    const tokens = useMemo(() => {
        const t = TOKENS[chainId];
        return [t.WETH, t.USDC, t.HEMIBTC, t.WBTC, t.VUSD].map((tk) => ({
            address: tk.address,
            symbol: tk.symbol as string,
            decimals: tk.decimals,
        }));
    }, []);

    // Splitter config + the connected wallet's on-chain role.
    const { data: cfg, refetch: refetchCfg } = useReadContracts({
        contracts: [
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "receiver0" },
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "receiver1" },
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "receiver0Share" },
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "SHARE_DENOMINATOR" },
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "owner" },
            {
                address: FEE_SPLITTER_ADDRESS,
                abi: feeSplitterAbi,
                functionName: "isWhitelistedClaimant",
                args: [address as Address],
            },
            {
                address: FACTORY,
                abi: factoryRoleAbi,
                functionName: "hasRoleOrOwner",
                args: [COMMUNITY_FEE_WITHDRAWER_ROLE, address as Address],
            },
        ],
        query: { enabled: Boolean(address) },
    });

    const receiver0 = cfg?.[0]?.result as Address | undefined;
    const receiver1 = cfg?.[1]?.result as Address | undefined;
    const receiver0Share = Number(cfg?.[2]?.result ?? 0);
    const shareDenom = Number(cfg?.[3]?.result ?? 10000) || 10000;
    const splitterOwner = cfg?.[4]?.result as Address | undefined;
    const canClaim = Boolean(cfg?.[5]?.result);
    const canWithdraw = Boolean(cfg?.[6]?.result);

    const brownfiPct = (receiver0Share / shareDenom) * 100;
    const hemiPct = 100 - brownfiPct;

    // Per-token balances held by the vault (pending) and the splitter (claimable).
    const { data: bals, refetch: refetchBals } = useReadContracts({
        contracts: tokens.flatMap((tk) => [
            { address: tk.address as Address, abi: erc20BalanceOfAbi, functionName: "balanceOf", args: [COMMUNITY_VAULT_ADDRESS] },
            { address: tk.address as Address, abi: erc20BalanceOfAbi, functionName: "balanceOf", args: [FEE_SPLITTER_ADDRESS] },
        ]),
    });

    const { data: vaultNative } = useBalance({ address: COMMUNITY_VAULT_ADDRESS });
    const { data: splitterNative, refetch: refetchNative } = useBalance({ address: FEE_SPLITTER_ADDRESS });

    const rows = tokens.map((tk, i) => ({
        token: tk,
        vaultBal: (bals?.[i * 2]?.result as bigint) ?? 0n,
        splitterBal: (bals?.[i * 2 + 1]?.result as bigint) ?? 0n,
    }));

    const vaultTokensToWithdraw = rows.filter((r) => r.vaultBal > 0n);
    const hasVaultFunds = vaultTokensToWithdraw.length > 0;

    const refetchAll = () => {
        refetchCfg();
        refetchBals();
        refetchNative();
    };

    // One writer, reused across actions; static titles avoid an "undefined" toast.
    const [txTitle, setTxTitle] = useState("Fee claim");
    const [pending, setPending] = useState<string | null>(null);
    const { data: txHash, writeContract } = useWriteContract();
    useTransactionAwait(
        txHash,
        { title: txTitle, tokenA: FEE_SPLITTER_ADDRESS, type: TransactionType.SWAP, callback: refetchAll },
        undefined
    );

    const withdrawFromVault = () => {
        setTxTitle("Withdraw fees from vault");
        setPending("withdraw");
        writeContract(
            {
                address: COMMUNITY_VAULT_ADDRESS,
                abi: communityVaultAbi,
                functionName: "withdrawTokens",
                args: [vaultTokensToWithdraw.map((r) => ({ token: r.token.address as Address, amount: r.vaultBal }))],
            },
            { onSettled: () => setPending(null) }
        );
    };

    const claimToken = (tokenAddress: string, symbol: string) => {
        setTxTitle(`Claim ${symbol} fees`);
        setPending(tokenAddress);
        writeContract(
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "claimAll", args: [tokenAddress as Address] },
            { onSettled: () => setPending(null) }
        );
    };

    const claimNative = () => {
        setTxTitle("Claim ETH fees");
        setPending("native");
        writeContract(
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "claimAllNative" },
            { onSettled: () => setPending(null) }
        );
    };

    const role: { label: string; cls: string } | null = !isConnected
        ? null
        : eq(address, splitterOwner)
        ? { label: "Owner / Admin", cls: "border-primary-200/40 text-primary-200 bg-primary-200/10" }
        : canWithdraw
        ? { label: "Withdrawer", cls: "border-blue-400/40 text-blue-300 bg-blue-400/10" }
        : canClaim
        ? { label: "Claimant", cls: "border-green-400/40 text-green-300 bg-green-400/10" }
        : { label: "Read-only", cls: "border-card-border text-text-300 bg-transparent" };

    return (
        <PageContainer>
            <div className="flex flex-col gap-6 w-full text-left">
                <div className="flex items-center justify-between">
                    <PageTitle title="Claim Fees" showSettings={false} />
                    {role && (
                        <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${role.cls}`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                            {role.label}
                        </span>
                    )}
                </div>

                {/* Split recipients */}
                <div className="rounded-xl border border-card-border bg-card p-4">
                    <div className="text-xs font-bold text-text-200 mb-3">FEE SPLIT</div>
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span>
                                BrownFi <span className="text-text-300">({receiver0 ? `${receiver0.slice(0, 6)}…${receiver0.slice(-4)}` : "—"})</span>
                                {eq(address, receiver0) && <span className="ml-2 text-primary-200">You</span>}
                            </span>
                            <span className="font-semibold">{brownfiPct.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>
                                Hemi <span className="text-text-300">({receiver1 ? `${receiver1.slice(0, 6)}…${receiver1.slice(-4)}` : "—"})</span>
                                {eq(address, receiver1) && <span className="ml-2 text-primary-200">You</span>}
                            </span>
                            <span className="font-semibold">{hemiPct.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                {!isConnected && (
                    <div className="rounded-xl border border-card-border bg-card p-4 text-sm text-text-200">
                        Connect your wallet to see what you can withdraw or claim.
                    </div>
                )}

                {/* Step 1 — withdraw from vault (withdrawer/owner only) */}
                {canWithdraw && (
                    <div className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between gap-4">
                        <div>
                            <div className="font-semibold text-sm">Step 1 — Withdraw from vault</div>
                            <div className="text-xs text-text-300">
                                {hasVaultFunds
                                    ? "Moves accumulated fees from the community vault into the splitter (Algebra takes its cut here)."
                                    : "No fees waiting in the vault right now."}
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            className="px-5 py-2 rounded-lg text-sm whitespace-nowrap"
                            disabled={!hasVaultFunds || pending === "withdraw"}
                            onClick={withdrawFromVault}
                        >
                            {pending === "withdraw" ? <Loader size={16} /> : "Withdraw"}
                        </Button>
                    </div>
                )}

                {/* Step 2 — claim from splitter (whitelisted) */}
                <div className="rounded-xl border border-card-border bg-card">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="font-semibold text-sm">Step 2 — Claim &amp; distribute</div>
                        {!canClaim && isConnected && (
                            <span className="text-xs text-text-300">Your wallet isn't whitelisted to claim.</span>
                        )}
                    </div>
                    <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-2 px-4 pb-1 text-[11px] font-bold text-text-300">
                        <span>TOKEN</span>
                        <span>IN VAULT</span>
                        <span>CLAIMABLE</span>
                        <span className="text-right">&nbsp;</span>
                    </div>
                    {rows.map((r) => (
                        <TokenRow
                            key={r.token.address}
                            token={r.token}
                            vaultBal={r.vaultBal}
                            splitterBal={r.splitterBal}
                            canClaim={canClaim}
                            claiming={pending === r.token.address}
                            onClaim={() => claimToken(r.token.address, r.token.symbol)}
                        />
                    ))}
                    {/* Native ETH */}
                    <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-2 px-4 py-3 border-t border-card-border text-sm">
                        <div className="flex items-center gap-2 font-medium">
                            <img src="/eth-logo.svg" alt="ETH" className="w-6 h-6 rounded-full" />
                            <span>ETH</span>
                        </div>
                        <div className="text-text-200">{vaultNative ? formatAmount(vaultNative.formatted, 6) : "0"}</div>
                        <div className="font-semibold">{splitterNative ? formatAmount(splitterNative.formatted, 6) : "0"}</div>
                        <div className="text-right">
                            <Button
                                variant="primary"
                                className="px-4 py-1.5 rounded-lg text-xs"
                                disabled={!canClaim || !splitterNative || splitterNative.value === 0n || pending === "native"}
                                onClick={claimNative}
                            >
                                {pending === "native" ? <Loader size={14} /> : "Claim"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-text-300">
                    Claiming distributes each token to both recipients at their fixed shares in one transaction — funds always go to the
                    receiver addresses above, never to the caller.
                </div>
            </div>
        </PageContainer>
    );
};

export default ClaimFeePage;
