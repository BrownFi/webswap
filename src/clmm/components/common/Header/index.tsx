import { Navigation } from "@clmm/components/common/Navigation";
import BrownFiLogo from "@clmm/assets/brownfi-logo.svg";
import { NavLink } from "react-router-dom";
import { Button } from "@clmm/components/ui/button";
import { ChevronDown, Clock } from "lucide-react";
import Loader from "../Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@clmm/components/ui/popover";
import { useState } from "react";
import { Address } from "viem";
import { TransactionCard } from "../TransactionCard";
import { useAccount } from "wagmi";
import { usePendingTransactions, usePendingTransactionsStore } from "@clmm/state/pendingTransactionsStore";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { cn, truncateHash } from "@clmm/utils";
import Settings from "../Settings";

const Header = () => (
    <header className="md:sticky top-2 z-10 flex h-full max-h-[64px] mt-4 justify-between items-center gap-4">
        <nav className="flex items-center gap-6 max-md:gap-3 h-full">
            <Brand />
            <Navigation />
        </nav>
        <Account />
    </header>
);

export const Brand = () => (
    <NavLink to={"/"} className="flex items-center shrink-0">
        <div className="transition-transform duration-300 hover:-rotate-[5deg]">
            <img className="min-w-[120px] w-[120px] lg:w-[142px] lg:min-w-[142px]" src={BrownFiLogo} alt="BrownFi" />
        </div>
    </NavLink>
);

const Account = () => {
    const { open } = useAppKit();
    const { caipNetwork: currentNetwork } = useAppKitNetwork();
    const { pendingTransactions } = usePendingTransactionsStore();
    const { address: account } = useAccount();

    const showTxHistory = account && pendingTransactions[account] ? Object.keys(pendingTransactions[account]).length > 0 : false;

    const pendingTxCount =
        account && pendingTransactions[account]
            ? Object.entries(pendingTransactions[account]).filter(([, transaction]) => transaction.loading).length
            : 0;

    return (
        <div className="flex h-full justify-end max-h-[64px] gap-2 whitespace-nowrap items-center">
            {showTxHistory && (
                <TransactionHistoryPopover>
                    {pendingTxCount > 0 ? (
                        <Button
                            className="flex font-normal items-center my-auto h-12 px-3 justify-center gap-2 cursor-pointer hover:bg-primary-button/80 border border-card bg-primary-button rounded-lg transition-all duration-200"
                            aria-label="Transaction history"
                        >
                            <Loader />
                            <span>{pendingTxCount}</span>
                            <span>Pending</span>
                        </Button>
                    ) : (
                        <Button
                            variant={"icon"}
                            size={"md"}
                            className="flex items-center my-auto h-12 px-3 justify-center gap-2 border border-card-border rounded-lg"
                            aria-label="Transaction history"
                        >
                            <Clock size={20} />
                        </Button>
                    )}
                </TransactionHistoryPopover>
            )}
            <Settings />
            <Button
                className="flex items-center gap-2 h-12 px-3 border border-card-border rounded-lg bg-transparent hover:opacity-80"
                variant={"icon"}
                size={"sm"}
                onClick={() => open({ view: "Networks" })}
            >
                {currentNetwork?.assets?.imageUrl && <img src={currentNetwork.assets.imageUrl} width={20} height={20} className="rounded-full" />}
                <span className="max-md:hidden font-medium">{currentNetwork?.name ?? ""}</span>
                <ChevronDown size={16} />
            </Button>
            <button
                onClick={() => open()}
                className={cn(
                    "flex items-center justify-center h-12 px-6 rounded-xl font-medium whitespace-nowrap transition-all",
                    account
                        ? "bg-transparent border border-card-border text-text-100 hover:opacity-80"
                        : "bg-primary-100 text-primary-300 hover:bg-primary-200"
                )}
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {account ? truncateHash(account as Address) : "Connect wallet"}
            </button>
        </div>
    );
};

const TransactionHistoryPopover = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const pendingTransactions = usePendingTransactions();
    const { address: account } = useAccount();

    if (account)
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>{children}</PopoverTrigger>
                <PopoverContent
                    className="w-fit max-h-80 flex flex-col gap-4 -translate-x-28 translate-y-2 max-xl:-translate-x-8 max-xs:-translate-x-4"
                    sideOffset={6}
                >
                    Transaction History
                    <hr />
                    <ul className="flex flex-col gap-3 w-64 overflow-auto ">
                        {Object.entries(pendingTransactions[account])
                            .reverse()
                            .map(([hash, transaction]) => (
                                <TransactionCard key={hash} hash={hash as Address} transaction={transaction} />
                            ))}
                    </ul>
                </PopoverContent>
            </Popover>
        );
};

export default Header;
