import SwapPair from "@clmm/components/swap/SwapPair";
import SwapButton from "@clmm/components/swap/SwapButton";
import SwapParams from "@clmm/components/swap/SwapParams";
import RouteComparison from "@clmm/components/swap/RouteComparison";
import Settings from "@clmm/components/common/Settings";
import PageContainer from "@clmm/components/common/PageContainer";
import { useDerivedSwapInfo, useSwapState } from "@clmm/state/swapStore.ts";
import { SwapField } from "@clmm/types/swap-field";
import { SwapPageProps, SwapPageView } from "./types";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import LimitOrdersModule from "@clmm/modules/LimitOrdersModule";
const { LimitOrder, SwapTypeSelector, LimitOrdersList } = LimitOrdersModule.components;

const SwapPage = ({ type }: SwapPageProps) => {
    const isLimitOrder = type === SwapPageView.LIMIT_ORDER;
    const [searchParams] = useSearchParams();
    const setCurrencies = useSwapState((state) => state.actions.setCurrencies);

    useEffect(() => {
        const inputCurrency = searchParams.get("inputCurrency");
        const outputCurrency = searchParams.get("outputCurrency");

        if (inputCurrency || outputCurrency) {
            const currentState = useSwapState.getState();
            setCurrencies(inputCurrency ?? currentState[SwapField.INPUT].currencyId, outputCurrency ?? currentState[SwapField.OUTPUT].currencyId);
        }
    }, [searchParams, setCurrencies]);

    const derivedSwap = useDerivedSwapInfo();

    return (
        <PageContainer>
            <div className="flex w-fit mx-auto">
                <SwapTypeSelector isLimitOrder={isLimitOrder} />
            </div>
            <div className="flex justify-center w-full mb-3">
                <div className="flex flex-col gap-2 w-full max-w-[690px]">
                    {/* Card matches webswap's AppBody: #1E1915 bg, 1px #2F2823 border, 24px radius/padding */}
                    <div
                        className="flex flex-col gap-2 w-full p-4 sm:p-6 rounded-2xl"
                        style={{ background: "#1E1915", border: "1px solid #2F2823" }}
                    >
                        {/* Swap header — "Swap" title + settings gear, like webswap's SwapHeader */}
                        <div className="flex items-center justify-between mb-2">
                            <h2
                                className="text-3xl font-semibold leading-tight"
                                style={{ color: "#FBFBFD", letterSpacing: "-0.02em" }}
                            >
                                Swap
                            </h2>
                            <Settings />
                        </div>
                        <SwapPair derivedSwap={derivedSwap} />
                        {!isLimitOrder && <RouteComparison derivedSwap={derivedSwap} />}
                        {isLimitOrder ? <LimitOrder derivedSwap={derivedSwap} /> : <SwapParams derivedSwap={derivedSwap} />}
                        {!isLimitOrder && <SwapButton derivedSwap={derivedSwap} />}
                    </div>
                </div>
            </div>
            {isLimitOrder && <LimitOrdersList />}
        </PageContainer>
    );
};

export default SwapPage;
