import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { useUSDCValue } from "@clmm/hooks/common/useUSDCValue";
import { IDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "@clmm/state/swapStore";
import { SwapField, SwapFieldType } from "@clmm/types/swap-field";
import { Currency, CurrencyAmount, maxAmountSpend, ZERO } from "@cryptoalgebra/integral-sdk";
import { useCallback, useEffect, useMemo } from "react";
import TokenCard from "../TokenCard";
import { ArrowUpDown } from "lucide-react";
import useWrapCallback, { WrapType } from "@clmm/hooks/swap/useWrapCallback";
import { TOKENS } from "@clmm/config";
import { useChainId } from "wagmi";
import { TradeState } from "@clmm/types/trade-state";

const SwapPair = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const chainId = DEFAULT_CHAIN_ID;

    const { independentField, typedValue } = useSwapState();

    const { currencyBalances, parsedAmounts, currencies, toggledTrade: trade, tradeState } = derivedSwap;

    const isTradeLoading = tradeState.state === TradeState.LOADING || tradeState.state === TradeState.SYNCING;

    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

    // const limitOrderPoolAddress =
    //     enabledModules.limitOrders && baseCurrency && quoteCurrency && CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainId] && !showWrap
    //         ? (computeCustomPoolAddress({
    //               tokenA: baseCurrency.wrapped,
    //               tokenB: quoteCurrency.wrapped,
    //               customPoolDeployer: CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainId],
    //           }) as Address)
    //         : undefined;

    // const [, limitOrderPool] = usePool(limitOrderPoolAddress);

    // const pairPrice = getTickToPrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, limitOrderPool?.tickCurrent);

    const dependentField: SwapFieldType = independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

    const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers();

    const handleInputSelect = useCallback(
        (inputCurrency: Currency) => {
            onCurrencySelection(SwapField.INPUT, inputCurrency);
        },
        [onCurrencySelection]
    );

    const handleOutputSelect = useCallback(
        (outputCurrency: Currency) => {
            onCurrencySelection(SwapField.OUTPUT, outputCurrency);
        },
        [onCurrencySelection]
    );

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(SwapField.INPUT, value);
        },
        [onUserInput]
    );
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(SwapField.OUTPUT, value);
        },
        [onUserInput]
    );

    const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[SwapField.INPUT]);
    const showMaxButton = Boolean(maxInputAmount?.greaterThan(0));

    const handleMaxInput = useCallback(() => {
        maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
    }, [maxInputAmount, onUserInput]);

    const { formatted: usdValueA } = useUSDCValue(parsedAmounts[SwapField.INPUT]);
    const { formatted: usdValueB } = useUSDCValue(parsedAmounts[SwapField.OUTPUT]);

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]:
            showWrap && independentField !== SwapField.LIMIT_ORDER_PRICE
                ? parsedAmounts[independentField]?.toExact() ?? ""
                : parsedAmounts[dependentField]?.toExact() ?? "",
    };

    const percentDifference = useMemo(() => {
        if (
            isTradeLoading ||
            !trade?.inputAmount.equalTo(parsedAmounts[SwapField.INPUT]?.quotient || ZERO) ||
            !trade?.outputAmount.equalTo(parsedAmounts[SwapField.OUTPUT]?.quotient || ZERO)
        )
            return;
        if (!usdValueA || !usdValueB) return 0;
        return ((usdValueB - usdValueA) / usdValueA) * 100;
    }, [isTradeLoading, trade?.inputAmount, trade?.outputAmount, parsedAmounts, usdValueA, usdValueB]);

    useEffect(() => {
        handleOutputSelect(TOKENS[chainId].USDC);
    }, [chainId, handleOutputSelect]);

    return (
        <div className="flex flex-col gap-1.5">
            <TokenCard
                label="You Pay"
                value={formattedAmounts[SwapField.INPUT]}
                currency={baseCurrency}
                otherCurrency={quoteCurrency}
                handleTokenSelection={handleInputSelect}
                handleValueChange={handleTypeInput}
                handleMaxValue={handleMaxInput}
                usdValue={usdValueA ?? undefined}
                showMaxButton={showMaxButton}
                showBalance={true}
                isLoading={independentField === SwapField.OUTPUT && isTradeLoading}
            />
            {/* Zero-height centered row → the arrow sits dead-center in the gap
                between the two panels regardless of their heights. */}
            <div className="relative flex items-center justify-center z-10" style={{ height: 0 }}>
                <button
                    className="flex items-center justify-center w-11 h-11 rounded-full hover:opacity-90 duration-200"
                    style={{ background: "#C47736" }}
                    onClick={onSwitchTokens}
                    aria-label="Switch tokens"
                >
                    <ArrowUpDown size={18} className="text-white" />
                </button>
            </div>
            <TokenCard
                label="Your Receive"
                value={formattedAmounts[SwapField.OUTPUT]}
                currency={quoteCurrency}
                otherCurrency={baseCurrency}
                handleTokenSelection={handleOutputSelect}
                handleValueChange={handleTypeOutput}
                usdValue={usdValueB ?? undefined}
                percentDifference={percentDifference}
                showBalance={true}
                isLoading={independentField === SwapField.INPUT && isTradeLoading}
            />
        </div>
    );
};

export default SwapPair;
