import CurrencyLogo from "@clmm/components/common/CurrencyLogo";
import { Button } from "@clmm/components/ui/button";
import { unwrappedToken } from "@clmm/utils/common/unwrappedToken";
import { Pool } from "@cryptoalgebra/integral-sdk";
import { ChevronLeft, Copy, ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { Address } from "viem";

/* Pair-aware pool header. Mirrors BrownFi webswap's pool detail header by
 * leading with the pair identity (logos + symbols + fee badge) rather than
 * jumping straight into "My positions". Address row supports copy + explorer
 * link for power users. */
const PoolHeader = ({ pool, showCreatePosition = true }: { pool: Pool | null | undefined; showCreatePosition?: boolean }) => {
    const { pool: poolAddress } = useParams<{ pool: Address }>();

    const token0 = pool ? unwrappedToken(pool.token0) : undefined;
    const token1 = pool ? unwrappedToken(pool.token1) : undefined;
    const fee = pool ? `${(pool.fee / 10_000).toFixed(2)}% Dynamic` : "";

    const [copied, setCopied] = useState(false);
    const onCopy = () => {
        if (!poolAddress) return;
        navigator.clipboard.writeText(poolAddress).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const shortAddr = poolAddress ? `${poolAddress.slice(0, 6)}…${poolAddress.slice(-4)}` : "";

    return (
        <div className="flex flex-col gap-3 w-full mb-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <NavLink to={"/clmm/pools"} className="flex items-center text-text-200 hover:text-text-100 shrink-0">
                        <ChevronLeft size={28} />
                    </NavLink>
                    <div className="flex items-center -space-x-2 shrink-0">
                        <CurrencyLogo currency={token0} size={32} className="ring-2 ring-bg-100" />
                        <CurrencyLogo currency={token1} size={32} className="ring-2 ring-bg-100" />
                    </div>
                    <h1
                        className="text-2xl sm:text-[36px] leading-tight sm:leading-[44px] text-text-100 truncate"
                        style={{ fontFamily: "Inter", fontWeight: 600, letterSpacing: "-0.02em" }}
                    >
                        {token0 && token1 ? `${token0.symbol} / ${token1.symbol}` : "Pool"}
                    </h1>
                    {pool && (
                        <span
                            className="hidden sm:inline-flex shrink-0 items-center px-2 py-1 rounded-md text-xs font-semibold bg-primary-800 text-primary-200"
                            style={{ fontFamily: "Inter" }}
                        >
                            {fee}
                        </span>
                    )}
                </div>

                {showCreatePosition && (
                    <Link to={"new-position"}>
                        <Button variant={"primary"} size={"md"} className="whitespace-nowrap rounded-lg gap-2">
                            <Plus size={20} />
                            <span className="max-sm:hidden">Create Position</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </Link>
                )}
            </div>

            {poolAddress && (
                <div className="flex items-center gap-2 text-xs text-text-300 ml-12">
                    <span style={{ fontFamily: "Inter" }}>{shortAddr}</span>
                    <button onClick={onCopy} className="hover:text-text-100 transition-colors" aria-label="Copy pool address">
                        <Copy size={12} />
                    </button>
                    {copied && <span className="text-primary-200">Copied</span>}
                    <a
                        href={`https://explorer.hemi.xyz/address/${poolAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-text-100 transition-colors"
                        aria-label="View on Berascan"
                    >
                        <ExternalLink size={12} />
                    </a>
                </div>
            )}
        </div>
    );
};

export default PoolHeader;
