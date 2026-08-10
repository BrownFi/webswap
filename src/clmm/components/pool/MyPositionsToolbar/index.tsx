import { FormattedPosition } from "@clmm/types/formatted-position";
import { formatPlural } from "@clmm/utils/common/formatPlural";
import { formatAmount } from "@clmm/utils/common/formatAmount";
import FilterPopover from "../FilterPopover";
import { Settings2 } from "lucide-react";
import SecurityStatusTag from "@clmm/components/pools/SecurityStatusTag";

interface MyPositionsToolbar {
    positionsData: FormattedPosition[];
    poolStatus: number | undefined | null;
}

const MyPositionsToolbar = ({ positionsData, poolStatus }: MyPositionsToolbar) => {
    const [myLiquidityUSD, myFeesUSD] = positionsData
        ? positionsData.reduce((acc, { liquidityUSD, feesUSD }) => [acc[0] + liquidityUSD, acc[1] + Number(feesUSD)], [0, 0])
        : [];

    return (
        <div className="flex items-center justify-between gap-4 min-h-[2.5rem] mb-3 w-full">
            {/* Aggregate stats for the user's positions in this pool. The pair name +
                logos already appear in the page header above, so we don't repeat them
                here. Reserve the row height so the list below doesn't shift on load. */}
            <div className="flex items-center gap-4 h-6 min-w-0">
                {myLiquidityUSD ? (
                    <>
                        <div className="font-semibold whitespace-nowrap">{`${positionsData?.length} ${formatPlural(
                            positionsData.length,
                            "position",
                            "positions"
                        )}`}</div>
                        <div className="w-1.5 h-1.5 bg-white/5 border border-white/25 rotate-45 shrink-0" />
                        <div className="text-cyan-200 font-semibold whitespace-nowrap">{`$${formatAmount(myLiquidityUSD || 0, 2)} TVL`}</div>
                        <div className="w-1.5 h-1.5 bg-white/5 border border-white/25 rotate-45 shrink-0" />
                        <div className="text-green-300 font-semibold whitespace-nowrap">{`$${formatAmount(myFeesUSD || 0, 2)} Fees`}</div>
                    </>
                ) : null}
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-auto">
                <SecurityStatusTag status={poolStatus} />
                <FilterPopover>
                    <Settings2 className="w-fit h-fit" />
                </FilterPopover>
            </div>
        </div>
    );
};

export default MyPositionsToolbar;
