import TokenCard from "@clmm/components/swap/TokenCard";
import { useUSDCValue } from "@clmm/hooks/common/useUSDCValue";
import { IDerivedMintInfo, useMintActionHandlers, useMintState } from "@clmm/state/mintStore";
import { useSwapActionHandlers } from "@clmm/state/swapStore";
import { SwapField } from "@clmm/types/swap-field";
import { Currency, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { ChevronsUpDownIcon } from "lucide-react";
import { useCallback } from "react";

interface ISelectPair {
    mintInfo: IDerivedMintInfo;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
}

const SelectPair = ({ mintInfo, currencyA, currencyB }: ISelectPair) => {
    const { onCurrencySelection, onSwitchTokens } = useSwapActionHandlers();

    const { onStartPriceInput } = useMintActionHandlers(mintInfo.noLiquidity);

    const { startPriceTypedValue } = useMintState();

    const { formatted: usdValueA } = useUSDCValue(tryParseAmount("1", currencyA));
    const { formatted: usdValueB } = useUSDCValue(tryParseAmount(startPriceTypedValue, currencyB));

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
            onStartPriceInput(value);
        },
        [onStartPriceInput]
    );

    return (
        <div className="flex flex-col gap-1">
            <TokenCard
                disabled
                value={"1"}
                currency={currencyA}
                otherCurrency={currencyB}
                handleTokenSelection={handleInputSelect}
                usdValue={usdValueA}
            />
            {/* Zero-height centered row → the switch button sits dead-center in the
                gap between the two cards regardless of their heights. */}
            <div className="relative flex items-center justify-center z-10" style={{ height: 0 }}>
                <button
                    className="p-1.5 bg-card-dark w-fit rounded-full border-[5px] border-card-border hover:bg-card-hover duration-200"
                    onClick={onSwitchTokens}
                >
                    <ChevronsUpDownIcon size={16} />
                </button>
            </div>
            <TokenCard
                value={startPriceTypedValue}
                handleTokenSelection={handleOutputSelect}
                currency={currencyB}
                otherCurrency={currencyA}
                handleValueChange={handleTypeInput}
                usdValue={usdValueB}
            />
        </div>
    );
};

export default SelectPair;
