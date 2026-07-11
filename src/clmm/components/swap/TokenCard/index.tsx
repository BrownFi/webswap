import CurrencyLogo from "@clmm/components/common/CurrencyLogo";
import TokenSelectorModal from "@clmm/components/modals/TokenSelectorModal";
import { Input } from "@clmm/components/ui/input";
import { cn, formatAmount } from "@clmm/utils";
import { Currency, Percent } from "@cryptoalgebra/integral-sdk";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";

interface TokenSwapCardProps {
    handleTokenSelection: (currency: Currency) => void;
    handleValueChange?: (value: string) => void;
    handleMaxValue?: () => void;
    value: string;
    label?: string;
    currency: Currency | null | undefined;
    otherCurrency: Currency | null | undefined;
    usdValue?: number | null;
    percentDifference?: number;
    isLoading?: boolean;
    priceImpact?: Percent;
    showMaxButton?: boolean;
    showBalance?: boolean;
    showNativeToken?: boolean;
    disabled?: boolean;
}

/* Colors mirror webswap's CurrencyInputPanel so the swap looks like one product.
 * Applied inline to match exact hex without a Tailwind CSS regen. */
const PANEL = { bg: "#2F2823", bgFocus: "#120F0D", border: "#493E35", borderFocus: "#C47736" };
const COPPER = "#C47736";

const TokenCard = ({
    handleTokenSelection,
    handleValueChange,
    handleMaxValue,
    value,
    label,
    currency,
    otherCurrency,
    usdValue,
    percentDifference,
    isLoading,
    showMaxButton,
    showBalance = true,
    showNativeToken,
    disabled,
}: TokenSwapCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focused, setFocused] = useState(false);

    const { address: account } = useAccount();

    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address: account,
        token: currency?.isNative ? undefined : (currency?.wrapped.address as Address),
    });

    const balanceString = useMemo(() => {
        if (isBalanceLoading) return "Loading...";
        return formatAmount(balance?.formatted || "0", 6);
    }, [balance, isBalanceLoading]);

    const handleInput = (value: string) => {
        let _value = value;
        if (value === ".") _value = "0.";
        handleValueChange?.(_value);
    };

    const refValue = useRef(value);

    useEffect(() => {
        if (value !== refValue.current && value !== "") {
            refValue.current = value;
        } else if (value === "" && !isLoading) {
            refValue.current = "";
        }
    }, [value, isLoading]);

    const [prevElement, setPrevElement] = useState<React.ReactNode>(null);

    useEffect(() => {
        if (usdValue !== undefined && usdValue !== 0) {
            const formattedUsdValue = usdValue ? `≈ $${formatAmount(usdValue, 4)}` : "N/A";

            let formattedPercentDiff: string | undefined = undefined;
            if (percentDifference !== undefined && Number.isFinite(percentDifference)) {
                if (percentDifference > 0) formattedPercentDiff = `(+${percentDifference.toFixed(2)}%)`;
                else if (percentDifference > -100 && percentDifference < 100) formattedPercentDiff = `(${percentDifference.toFixed(2)}%)`;
            }

            setPrevElement(
                <p className="text-text-300">
                    {formattedUsdValue}
                    {percentDifference !== undefined && formattedPercentDiff && (
                        <span
                            className={
                                percentDifference > 1
                                    ? "text-green-500"
                                    : (percentDifference > 0 && percentDifference < 1) || (percentDifference < 0 && percentDifference > -1)
                                    ? "text-text-100"
                                    : percentDifference < -1 && percentDifference > -3
                                    ? "text-orange-300"
                                    : percentDifference < -3 && percentDifference > -100
                                    ? "text-red-400"
                                    : "text-text-100"
                            }
                        >
                            {` ${formattedPercentDiff}`}
                        </span>
                    )}
                </p>
            );
        }

        if (value === "" && value === refValue.current) {
            setPrevElement(null);
        }
    }, [percentDifference, usdValue, value]);

    const handleTokenSelect = useCallback(
        (newCurrency: Currency) => {
            setIsOpen(false);
            handleTokenSelection(newCurrency);
        },
        [handleTokenSelection]
    );

    return (
        <div
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex flex-col gap-3 w-full p-5 max-sm:p-4 transition-colors"
            style={{
                background: focused ? PANEL.bgFocus : PANEL.bg,
                border: `2px solid ${focused ? PANEL.borderFocus : PANEL.border}`,
                borderRadius: "18px",
            }}
        >
            {/* Label + balance row */}
            <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#CFC7C1" }} className="font-medium">
                    {label}
                </span>
                {currency && showBalance && (
                    <div className="flex items-center gap-2 whitespace-nowrap text-text-300">
                        <span>Balance: {balanceString}</span>
                        {showMaxButton && (
                            <button
                                className="font-semibold hover:opacity-80"
                                style={{ color: COPPER }}
                                onClick={handleMaxValue}
                            >
                                MAX
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Amount + token pill row */}
            <div className="flex items-center justify-between gap-3">
                <Input
                    disabled={disabled}
                    type={"text"}
                    value={value || refValue.current}
                    id={`amount-${currency?.symbol}`}
                    onUserInput={(v) => handleInput(v)}
                    className={cn(
                        "border-none text-3xl max-sm:text-2xl font-semibold w-full p-0 bg-transparent ring-0! disabled:cursor-default text-text-100 placeholder:text-text-400",
                        isLoading ? "animate-pulse" : ""
                    )}
                    placeholder={"0.0"}
                    maxDecimals={currency?.decimals}
                />

                <TokenSelectorModal
                    showNativeToken={showNativeToken}
                    onSelect={handleTokenSelect}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    otherCurrency={otherCurrency}
                >
                    <button
                        className="group flex items-center gap-2 shrink-0 px-3 py-2 hover:opacity-90 transition-opacity"
                        style={{ background: "#2F2823", border: "1px solid #807266", borderRadius: "6px" }}
                        onClick={() => setIsOpen(true)}
                    >
                        {currency ? (
                            <>
                                <CurrencyLogo currency={currency} size={24} />
                                <span className="font-semibold text-base text-text-100">{currency.symbol}</span>
                            </>
                        ) : (
                            <span className="font-semibold text-base text-text-100 pl-1">Select token</span>
                        )}
                        <ChevronDown size={18} className="text-text-200 group-hover:text-text-100" />
                    </button>
                </TokenSelectorModal>
            </div>

            {/* USD value — only when there's an amount (webswap shows nothing when empty) */}
            {prevElement && <div className={cn("text-sm", isLoading ? "animate-pulse" : "")}>{prevElement}</div>}
        </div>
    );
};

export default TokenCard;
