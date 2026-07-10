import SwapPair from "@clmm/components/swap/SwapPair";
import SwapButton from "@clmm/components/swap/SwapButton";
import SwapParams from "@clmm/components/swap/SwapParams";
import PageContainer from "@clmm/components/common/PageContainer";
import { useDerivedSwapInfo } from "@clmm/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";

import LimitOrdersModule from "@clmm/modules/LimitOrdersModule";
const { LimitOrder, SwapTypeSelector, LimitOrdersList } = LimitOrdersModule.components;

const SwapPage = ({ type }: SwapPageProps) => {
    const isLimitOrder = type === SwapPageView.LIMIT_ORDER;

    const derivedSwap = useDerivedSwapInfo();

    return (
        <PageContainer>
            <div className="flex w-fit mx-auto mb-8">
                <SwapTypeSelector isLimitOrder={isLimitOrder} />
            </div>
            <div className="flex justify-center w-full mb-3">
                <div className="flex flex-col gap-2 w-full max-w-md">
                    <div className="flex flex-col gap-1.5 w-full bg-dark-gradient border border-card-border p-2 rounded-xl">
                        <SwapPair derivedSwap={derivedSwap} />
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
