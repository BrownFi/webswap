import { cn } from "@clmm/utils";
import { enabledModules } from "@clmm/config/app-modules";
import { SwapPageView, SwapPageViewType } from "@clmm/pages/Swap/types";
import { NavLink } from "react-router-dom";

// Swap / Limit Order selector — mirrors the upstream integral-ui SwapTypeSelector,
// adapted for webswap's /clamm/* mount (absolute paths keep the toggle inside CLMM)
// and the card-header layout (compact segmented control, no page-level title).
type Tab = {
    to: string;
    label: string;
    value: SwapPageViewType;
    enabled?: boolean;
};

const tabs: Tab[] = [
    { to: "/clamm/swap", label: "Swap", value: SwapPageView.SWAP },
    {
        to: "/clamm/limit-order",
        label: "Limit Order",
        value: SwapPageView.LIMIT_ORDER,
        enabled: enabledModules.LimitOrdersModule,
    },
];

export function SwapTypeSelector({ type }: { type: SwapPageViewType }) {
    const visibleTabs = tabs.filter((t) => t.enabled !== false);
    const activeIndex = visibleTabs.findIndex((t) => t.value === type);

    return (
        <div className="relative flex w-full lg:w-fit rounded-xl bg-card-light overflow-hidden">
            {visibleTabs.map((tab) => {
                const isActive = tab.value === type;

                return (
                    <NavLink key={tab.to} to={tab.to} className="relative z-10 w-full">
                        <button
                            type="button"
                            className={cn(
                                "px-4 py-2 text-sm font-medium w-full whitespace-nowrap",
                                isActive ? "text-primary-200 bg-card-border/40" : "text-text-300 hover:text-text",
                                activeIndex === 0 && "rounded-l-xl",
                                activeIndex === visibleTabs.length - 1 && "rounded-r-xl",
                            )}
                        >
                            {tab.label}
                        </button>
                    </NavLink>
                );
            })}
        </div>
    );
}
