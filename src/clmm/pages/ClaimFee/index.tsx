import { useMemo, useState } from "react";
import { useAccount, useBalance, useReadContracts, useWriteContract } from "wagmi";
import { Address, formatUnits } from "viem";
import { DEFAULT_CHAIN_ID, TOKENS } from "@clmm/config";
import { FEE_SPLITTER_ADDRESS, erc20BalanceOfAbi, feeSplitterAbi } from "@clmm/config/fee-split";
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
// Three equal columns, each centered, so header and rows line up cleanly.
const GRID = "grid-cols-3";

const eq = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

function TokenRow({
    token,
    claimable,
    canClaim,
    onClaim,
    claiming,
}: {
    token: { address: string; symbol: string; decimals: number };
    claimable: bigint;
    canClaim: boolean;
    onClaim: () => void;
    claiming: boolean;
}) {
    // useCurrency may not resolve an unknown token; CurrencyLogo renders a skeleton
    // for undefined and initials for a known token with no logo — so no row crashes.
    const currency = useCurrency(token.address as Address, true);

    return (
        <div className={`grid ${GRID} items-center gap-2 px-4 py-3 border-t border-card-border text-sm`}>
            <div className="flex items-center gap-2 font-medium">
                <CurrencyLogo currency={currency} size={24} />
                <span>{token.symbol || "?"}</span>
            </div>
            <div className="font-semibold text-center">{formatAmount(formatUnits(claimable, token.decimals ?? 18), 6)}</div>
            <div className="flex justify-end">
                <Button
                    variant="primary"
                    className="px-4 py-1.5 rounded-lg text-xs"
                    disabled={!canClaim || claimable === 0n || claiming}
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

    // Splitter config + whether the connected wallet is a whitelisted claimant.
    const { data: cfg, refetch: refetchCfg } = useReadContracts({
        contracts: [
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "receiver0" },
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "receiver1" },
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "receiver0Share" },
            { address: FEE_SPLITTER_ADDRESS, abi: feeSplitterAbi, functionName: "SHARE_DENOMINATOR" },
            {
                address: FEE_SPLITTER_ADDRESS,
                abi: feeSplitterAbi,
                functionName: "isWhitelistedClaimant",
                args: [address as Address],
            },
        ],
        query: { enabled: Boolean(address) },
    });

    const receiver0 = cfg?.[0]?.result as Address | undefined;
    const receiver1 = cfg?.[1]?.result as Address | undefined;
    const receiver0Share = Number(cfg?.[2]?.result ?? 0);
    const shareDenom = Number(cfg?.[3]?.result ?? 10000) || 10000;
    const canClaim = Boolean(cfg?.[4]?.result);

    const brownfiPct = (receiver0Share / shareDenom) * 100;
    const hemiPct = 100 - brownfiPct;

    // Claimable balances held by the splitter (fees are moved here off-UI; this page
    // only distributes what's already in the splitter).
    const { data: bals, refetch: refetchBals } = useReadContracts({
        contracts: tokens.map((tk) => ({
            address: tk.address as Address,
            abi: erc20BalanceOfAbi,
            functionName: "balanceOf" as const,
            args: [FEE_SPLITTER_ADDRESS] as const,
        })),
    });

    const { data: splitterNative, refetch: refetchNative } = useBalance({ address: FEE_SPLITTER_ADDRESS });

    const rows = tokens.map((tk, i) => ({ token: tk, claimable: (bals?.[i]?.result as bigint) ?? 0n }));

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

    const role = !isConnected
        ? null
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
                        Connect your wallet to claim.
                    </div>
                )}

                {/* Claimable table */}
                <div className="rounded-xl border border-card-border bg-card">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="font-semibold text-sm">Claimable fees</div>
                        {!canClaim && isConnected && (
                            <span className="text-xs text-text-300">Your wallet isn't whitelisted to claim.</span>
                        )}
                    </div>
                    <div className={`grid ${GRID} gap-2 px-4 pb-1 text-[11px] font-bold text-text-300`}>
                        <span className="text-left">TOKEN</span>
                        <span className="text-center">CLAIMABLE</span>
                        <span className="text-right">ACTION</span>
                    </div>
                    {rows.map((r) => (
                        <TokenRow
                            key={r.token.address}
                            token={r.token}
                            claimable={r.claimable}
                            canClaim={canClaim}
                            claiming={pending === r.token.address}
                            onClaim={() => claimToken(r.token.address, r.token.symbol)}
                        />
                    ))}
                    {/* Native ETH */}
                    <div className={`grid ${GRID} items-center gap-2 px-4 py-3 border-t border-card-border text-sm`}>
                        <div className="flex items-center gap-2 font-medium">
                            <img src="/eth-logo.svg" alt="ETH" className="w-6 h-6 rounded-full" />
                            <span>ETH</span>
                        </div>
                        <div className="font-semibold text-center">{splitterNative ? formatAmount(splitterNative.formatted, 6) : "0"}</div>
                        <div className="flex justify-end">
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
                    Each claim distributes that token to both recipients at their fixed shares in one transaction — funds always go to the
                    receiver addresses above, never to the caller.
                </div>
            </div>
        </PageContainer>
    );
};

export default ClaimFeePage;
