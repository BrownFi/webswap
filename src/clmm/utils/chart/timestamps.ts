import { CHART_SPAN } from "@clmm/types/swap-chart";

export const UNIX_TIMESTAMPS = {
    [CHART_SPAN.DAY]: 2419200 / 30,
    [CHART_SPAN.WEEK]: (2419200 / 30) * 7,
    [CHART_SPAN.MONTH]: 2419200,
    [CHART_SPAN.THREE_MONTH]: 2419200 * 3,
    [CHART_SPAN.YEAR]: 2419200 * 12,
};
