import { ColumnDef } from "@tanstack/react-table";
import { HeaderItem } from "./common";
import { Address } from "viem";
import CurrencyLogo from "../CurrencyLogo";
import { Skeleton } from "@clmm/components/ui/skeleton";
import { useCurrency } from "@clmm/hooks/common/useCurrency";
import { formatAmount } from "@clmm/utils/common/formatAmount";
import { FormattedPool } from "@clmm/hooks/pools/useFormattedPools";
import { enabledModules } from "@clmm/config/app-modules";
import IncentiveBadge from "@clmm/components/pools/IncentiveBadge";

import ALMModule from "@clmm/modules/ALMModule";
const { ALMTag } = ALMModule.components;

import FarmingModule from "@clmm/modules/FarmingModule";
const { FarmTag } = FarmingModule.components;

import BoostedPoolsModule from "@clmm/modules/BoostedPoolsModule";
const { BoostedTag, BoostedAPR } = BoostedPoolsModule.components;
const { useBoostedTokenAPR } = BoostedPoolsModule.hooks;

/* USD metric cell: show a dash when the indexer hasn't populated the value
 * (undefined / NaN) instead of a confusing "$∞". Genuine 0 still shows "$0". */
const usdCell = (value: unknown): string => {
    const n = Number(value);
    return Number.isFinite(n) ? `$${formatAmount(n, 2)}` : "-";
};

const PoolPair = ({ pair, id, hasALM, hasActiveFarming }: FormattedPool) => {
    const token0 = pair.token0.id as Address;
    const token1 = pair.token1.id as Address;

    const currencyA = useCurrency(token0, true);
    const currencyB = useCurrency(token1, true);

    return (
        <div className="flex items-center gap-4 ml-2">
            <div className="flex">
                <CurrencyLogo currency={currencyA} size={30} />
                <CurrencyLogo currency={currencyB} size={30} className="-ml-2" />
            </div>

            {currencyA && currencyB ? (
                <div>{`${currencyA?.symbol} - ${currencyB?.symbol}`}</div>
            ) : (
                <Skeleton className="h-[20px] w-[90px] bg-card" />
            )}

            <div className="flex items-center gap-2">
                {hasActiveFarming && <FarmTag poolAddress={id} />}
                {hasALM && <ALMTag poolAddress={id} />}
                <BoostedTag currencyA={currencyA} currencyB={currencyB} />
            </div>
            {/* <div className="bg-muted-primary text-primary-text rounded-xl px-2 py-1">{`${fee}%`}</div> */}
            {/* {hasALM ? <img className="w-6 h-6 overflow-hidden rounded-full" src={almLogo} alt="ALM" /> : null} */}
        </div>
    );
};

// Fee APR — trading fees only (subgraph-derived), always present.
const FeeAPR = ({ isBoostedToken0, isBoostedToken1, isBoostedPool, pair, feeApr }: FormattedPool) => {
    const { data: token0Apr } = useBoostedTokenAPR(isBoostedToken0 ? (pair.token0.id as Address) : undefined);
    const { data: token1Apr } = useBoostedTokenAPR(isBoostedToken1 ? (pair.token1.id as Address) : undefined);

    return (
        <div className="flex items-center gap-2">
            <span>{`${formatAmount(feeApr, 2)}%`}</span>
            {isBoostedPool && (
                <BoostedAPR
                    token0Apr={token0Apr}
                    token1Apr={token1Apr}
                    token0Name={pair.token0.name}
                    token1Name={pair.token1.name}
                    baseAPR={feeApr}
                />
            )}
        </div>
    );
};

// Incentive APR — Merkl reward on top of fees; the badge links to the pool's Merkl
// opportunity page. Shows a dash for pools with no live campaign.
const IncentiveAPR = ({ id }: FormattedPool) => <IncentiveBadge poolId={id} variant="cell" />;

export const poolsColumns: ColumnDef<FormattedPool>[] = ([
    {
        accessorKey: "pair",
        header: () => <HeaderItem className="ml-2">Pool</HeaderItem>,
        cell: ({ row }) => <PoolPair {...row.original} />,
        filterFn: (v, _, value) =>
            [v.original.pair.token0.symbol, v.original.pair.token1.symbol, v.original.pair.token0.name, v.original.pair.token1.name]
                .join(" ")
                .toLowerCase()
                .includes(value),
    },
    enabledModules.CustomPoolsModule && {
        accessorKey: "deployer",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fee
            </HeaderItem>
        ),
        cell: ({ row }) => `${row.original.fee}%`,
    },
    {
        accessorKey: "tvlUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                TVL
            </HeaderItem>
        ),
        cell: ({ getValue }) => usdCell(getValue()),
    },
    {
        accessorKey: "volume24USD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Volume 24H
            </HeaderItem>
        ),
        cell: ({ getValue }) => usdCell(getValue()),
    },
    {
        accessorKey: "fees24USD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fees 24H
            </HeaderItem>
        ),
        cell: ({ getValue }) => usdCell(getValue()),
    },
    {
        accessorKey: "feeApr",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fees APR
            </HeaderItem>
        ),
        cell: ({ row }) => <FeeAPR {...row.original} />,
    },
    {
        accessorKey: "incentiveApr",
        // Value is fetched per pool in the cell (per-pool BE endpoint), so it isn't in
        // the row data — no column sort.
        header: () => <HeaderItem>Incentive APR</HeaderItem>,
        cell: ({ row }) => <IncentiveAPR {...row.original} />,
    },
] as (ColumnDef<FormattedPool> | false)[]).filter((col): col is ColumnDef<FormattedPool> => Boolean(col));
