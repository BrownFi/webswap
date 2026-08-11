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
import { useNordsternSwap } from "@clmm/hooks/swap/useNordsternSwap";
import { formatUnits } from "viem";

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
    const { formatted: nativeUsdValueB } = useUSDCValue(parsedAmounts[SwapField.OUTPUT]);

    // When Nordstern wins the best-of, the "You Receive" amount is Nordstern's
    // output, not the native trade's — show that (plus its USD / % delta) so every
    // field matches what the Swap button will actually execute.
    const nordstern = useNordsternSwap(derivedSwap);
    const showNordsternOut = Boolean(
        nordstern.useNordstern && nordstern.quote && quoteCurrency && independentField === SwapField.INPUT && !showWrap,
    );

    const nordsternOutAmount = useMemo(
        () =>
            showNordsternOut && quoteCurrency && nordstern.quote
                ? CurrencyAmount.fromRawAmount(quoteCurrency.wrapped, nordstern.quote.toAmount.toString())
                : undefined,
        [showNordsternOut, quoteCurrency, nordstern.quote],
    );
    const { formatted: nordsternUsdValueB } = useUSDCValue(nordsternOutAmount);

    // USD next to "You Receive" must track whichever route is actually displayed.
    const usdValueB = showNordsternOut ? nordsternUsdValueB : nativeUsdValueB;

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]:
            showWrap && independentField !== SwapField.LIMIT_ORDER_PRICE
                ? parsedAmounts[independentField]?.toExact() ?? ""
                : parsedAmounts[dependentField]?.toExact() ?? "",
    };

    const percentDifference = useMemo(() => {
        // Nordstern route: compare its USD output to the input USD directly. The
        // native `trade` here is the losing route, so its amounts don't apply.
        if (showNordsternOut) {
            if (!usdValueA || !nordsternUsdValueB) return 0;
            return ((nordsternUsdValueB - usdValueA) / usdValueA) * 100;
        }
        if (
            isTradeLoading ||
            !trade?.inputAmount.equalTo(parsedAmounts[SwapField.INPUT]?.quotient || ZERO) ||
            !trade?.outputAmount.equalTo(parsedAmounts[SwapField.OUTPUT]?.quotient || ZERO)
        )
            return;
        if (!usdValueA || !usdValueB) return 0;
        return ((usdValueB - usdValueA) / usdValueA) * 100;
    }, [showNordsternOut, isTradeLoading, trade?.inputAmount, trade?.outputAmount, parsedAmounts, usdValueA, usdValueB, nordsternUsdValueB]);

    useEffect(() => {
        handleOutputSelect(TOKENS[chainId].USDC);
    }, [chainId, handleOutputSelect]);

    const outputValue = showNordsternOut
        ? formatUnits(nordstern.quote!.toAmount, quoteCurrency!.decimals)
        : formattedAmounts[SwapField.OUTPUT];

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
                    className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full hover:opacity-90 duration-200"
                    style={{ background: "#C47736" }}
                    onClick={onSwitchTokens}
                    aria-label="Switch tokens"
                >
                    <ArrowUpDown size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                </button>
            </div>
            <TokenCard
                label="You Receive"
                value={outputValue}
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
