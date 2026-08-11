import { ColumnDef } from "@tanstack/react-table";
import { HeaderItem } from "./common";
import { formatAmount } from "@clmm/utils/common/formatAmount";

interface MyPosition {
    id: string;
    outOfRange: boolean;
    range: string;
    liquidityUSD: number;
    feesUSD: number | null;
    apr: number;
}

/* Compact status pill matching BrownFi's badge style: small rounded rect,
 * subtle tinted background, small dot, semibold label. */
const StatusPill = ({ outOfRange }: { outOfRange: boolean }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${
            outOfRange ? "bg-yellow-400/10 text-yellow-400" : "bg-green-400/10 text-green-400"
        }`}
    >
        <span className={`w-1.5 h-1.5 rounded-full ${outOfRange ? "bg-yellow-400" : "bg-green-400"}`} />
        {outOfRange ? "Out of range" : "In range"}
    </span>
);

export const myPositionsColumns: ColumnDef<MyPosition>[] = [
    {
        accessorKey: "id",
        header: () => <HeaderItem className="min-w-[110px] ml-2">ID</HeaderItem>,
        cell: ({ getValue }) => <span className="ml-4 font-semibold text-text-100">{`#${getValue()}`}</span>,
    },
    {
        accessorKey: "liquidityUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Liquidity
            </HeaderItem>
        ),
        cell: ({ getValue }) => <span className="text-text-100">{`$${formatAmount(getValue() as number, 2)}`}</span>,
    },
    {
        accessorKey: "feesUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fees
            </HeaderItem>
        ),
        cell: ({ getValue }) => {
            return typeof getValue() === "number" ? (
                <span className="text-green-300">{`$${formatAmount(getValue() as number, 2)}`}</span>
            ) : (
                " "
            );
        },
    },
    {
        accessorKey: "outOfRange",
        header: ({ column }) => (
            <HeaderItem
                className="min-w-[100px]"
                sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
                isAsc={column.getIsSorted() === "asc"}
            >
                Status
            </HeaderItem>
        ),
        cell: ({ getValue }) => <StatusPill outOfRange={Boolean(getValue())} />,
    },
    {
        accessorKey: "range",
        header: () => <HeaderItem className="min-w-[180px]">Range</HeaderItem>,
        cell: ({ getValue }) => <span className="text-text-200 text-sm">{getValue() as string}</span>,
    },
    {
        accessorKey: "apr",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fees APR
            </HeaderItem>
        ),
        cell: ({ getValue }) => <span className="text-primary-200 font-semibold">{`${formatAmount(getValue() as number, 2)}%`}</span>,
    },
];
