import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@clmm/components/ui/popover";
import { CHART_TYPE, ChartTypeType, PoolChartTypeType } from "@clmm/types/swap-chart";
import { Button } from "@clmm/components/ui/button";

interface IChartTypeSelector {
    chartType: ChartTypeType | PoolChartTypeType;
    handleChangeChartType: (span: ChartTypeType) => void;
}

const titles = {
    [CHART_TYPE.TVL]: "TVL",
    [CHART_TYPE.VOLUME]: "Volume",
    [CHART_TYPE.FEES]: "Fees",
    [CHART_TYPE.PRICE]: "Price",
};

export function ChartTypeSelector({ chartType, handleChangeChartType }: IChartTypeSelector) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="border" variant={"ghost"} size={"sm"}>
                    <span>{titles[chartType]}</span>
                    <ChevronDown size={16} />
                </Button>
            </PopoverTrigger>
            <PopoverContent align={"end"} className="mx-auto flex w-fit flex-col gap-2 rounded-xl p-2">
                {Object.entries(titles)
                    // .filter(([type]) => (showAPR ? true : type !== POOL_CHART_TYPE.APR))
                    .map(([type, title]) => (
                        <Button
                            key={type}
                            size={"sm"}
                            variant={chartType === type ? "iconHover" : "icon"}
                            onClick={() => handleChangeChartType(type as ChartTypeType)}
                        >
                            {title}
                        </Button>
                    ))}
            </PopoverContent>
        </Popover>
    );
}
