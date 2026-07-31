import Loader from "@clmm/components/common/Loader";
import { usePoolPlugins } from "@clmm/hooks/pools/usePoolPlugins";
import useWrapCallback, { WrapType } from "@clmm/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, useSwapState } from "@clmm/state/swapStore";
import { SwapField } from "@clmm/types/swap-field";
import { warningSeverity } from "@clmm/utils/swap/prices";
import { Percent, TradeType } from "@cryptoalgebra/integral-sdk";
import { ChevronDownIcon, ZapIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { Button } from "@clmm/components/ui/button.tsx";
import { useOverrideFee } from "@clmm/hooks/swap/useOverrideFee";
import { TradeState } from "@clmm/types/trade-state";
import { cn, formatAmount } from "@clmm/utils";
import { SwapRouteModal } from "../SwapRouteModal";
import { useNordsternSwap } from "@clmm/hooks/swap/useNordsternSwap";
import { NORDSTERN_FEE_PERCENT } from "@clmm/config/nordstern";
import { formatUnits } from "viem";

const SwapParams = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { allowedSlippage, currencies, poolAddress, toggledTrade: trade, tradeState, priceImpact: derivedPriceImpact } = derivedSwap;
    const { typedValue } = useSwapState();

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const [isExpanded, toggleExpanded] = useState(false);

    const { dynamicFeePlugin } = usePoolPlugins(poolAddress);

    const { fee, fees } = useOverrideFee(trade);

    const isSmartTrade = trade && "routes" in trade;

    const priceImpact = useMemo(() => {
        if (!trade) return undefined;

        if (isSmartTrade) {
            return SmartRouter.getPriceImpact(trade);
        } else {
            return derivedPriceImpact ?? undefined;
        }
    }, [trade, isSmartTrade, derivedPriceImpact]);

    const minimumAmountOut = useMemo(() => {
        if (!trade) return undefined;

        if (isSmartTrade) {
            return trade.tradeType === TradeType.EXACT_INPUT
                ? `${SmartRouter.minimumAmountOut(trade, allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                : `${SmartRouter.maximumAmountIn(trade, allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`;
        } else {
            return trade.tradeType === TradeType.EXACT_INPUT
                ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`;
        }
    }, [allowedSlippage, isSmartTrade, trade]);

    const isTradeLoading = tradeState.state === TradeState.LOADING;

    // When the Nordstern aggregator route wins, its quote (not the losing native
    // trade) must drive the detail rows. Nordstern doesn't expose a per-pool price
    // impact, and the only fee we add on top is the frontend convenience fee.
    const nordstern = useNordsternSwap(derivedSwap);
    const outputCurrency = currencies[SwapField.OUTPUT];
    const useNord = Boolean(nordstern.useNordstern && nordstern.quote);

    const nordMinReceived =
        useNord && outputCurrency && nordstern.quote
            ? `${formatAmount(formatUnits(nordstern.quote.minToAmount, outputCurrency.decimals), 6)} ${outputCurrency.symbol}`
            : undefined;

    const feeString = useNord
        ? `${NORDSTERN_FEE_PERCENT}% fee`
        : fee !== undefined
        ? `${fee.toFixed(4)}% fee`
        : undefined;

    const effectiveMinReceived = useNord ? nordMinReceived : minimumAmountOut;
    const effectivePriceImpact = useNord ? undefined : priceImpact;
    const minReceivedLabel = useNord || trade?.tradeType === TradeType.EXACT_INPUT ? "Minimum received" : "Maximum sent";

    if (wrapType !== WrapType.NOT_APPLICABLE) return;

    return trade || useNord ? (
        <div className="rounded">
            <div className="flex justify-between">
                <button
                    className="flex items-center w-full text-md mb-1 text-center bg-card-dark border border-card-border py-1 px-3 rounded-lg"
                    onClick={() => toggleExpanded(!isExpanded)}
                >
                    {feeString !== undefined ? (
                        <div className="rounded select-none pointer px-1.5 py-1 flex items-center relative">
                            {!useNord && dynamicFeePlugin && <ZapIcon className="mr-2 fill-text" strokeWidth={1} stroke="white" size={16} />}
                            <span>{feeString}</span>
                        </div>
                    ) : (
                        <div className="rounded select-none px-1.5 py-1 flex items-center relative">
                            <Loader size={16} />
                        </div>
                    )}
                    <div className={`ml-auto duration-300 ${isExpanded && "rotate-180"}`}>
                        <ChevronDownIcon strokeWidth={2} size={16} />
                    </div>
                </button>
            </div>
            <div
                className={cn(
                    "h-0 duration-300 will-change-[height] overflow-hidden bg-card-dark rounded-lg",
                    isExpanded && (useNord ? "h-[124px]" : "h-[160px]"),
                    isExpanded && "border border-card-border"
                )}
            >
                <div className="flex flex-col gap-2.5 px-3 py-2 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Route</span>
                        <span>
                            {useNord || !trade ? (
                                <span className="text-text-100 font-medium">Nordstern</span>
                            ) : (
                                <SwapRouteModal
                                    isOpen={isOpen}
                                    setIsOpen={setIsOpen}
                                    routes={isSmartTrade ? trade?.routes : trade.swaps.map((swap) => swap.route)}
                                    fees={fees}
                                    tradeType={trade?.tradeType}
                                >
                                    <Button size={"sm"} variant={"outline"} onClick={() => setIsOpen(true)}>
                                        Show
                                    </Button>
                                </SwapRouteModal>
                            )}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-semibold">{minReceivedLabel}</span>
                        <span>{effectiveMinReceived}</span>
                    </div>
                    {/*<div className="flex items-center justify-between">*/}
                    {/*    <span className="font-semibold">LP Fee</span>*/}
                    {/*    <span>{LPFeeString}</span>*/}
                    {/*</div>*/}
                    {/* Nordstern (aggregator) doesn't expose a per-pool price impact — hide the row rather than show a meaningless "-". */}
                    {!useNord && (
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Price impact</span>
                            <span>
                                <PriceImpact priceImpact={effectivePriceImpact} />
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Slippage tolerance</span>
                        <span>{allowedSlippage.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </div>
    ) : trade !== undefined && isTradeLoading ? (
        <div className="flex justify-center mb-1 bg-card-dark border border-card-border py-3 px-3 rounded-lg">
            <Loader size={17} className="text-text" />
        </div>
    ) : (
        <div className="text-md mb-1 text-center opacity-70 bg-card-dark border border-card-border py-2 px-3 rounded-lg">
            Select an amount for swap
        </div>
    );
};

const PriceImpact = ({ priceImpact }: { priceImpact: Percent | undefined }) => {
    const severity = warningSeverity(priceImpact);

    const color = severity === 3 || severity === 4 ? "text-red-400" : severity === 2 ? "text-yellow-400" : "currentColor";

    return <span className={color}>{priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : "-"}</span>;
};

export default SwapParams;
