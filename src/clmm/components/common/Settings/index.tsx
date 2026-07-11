import { Button } from "@clmm/components/ui/button";
import { Input } from "@clmm/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@clmm/components/ui/popover";
import { Separator } from "@clmm/components/ui/separator";
import { Switch } from "@clmm/components/ui/switch";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@clmm/components/ui/hover-card";
import { useUserState } from "@clmm/state/userStore";
import { Percent } from "@cryptoalgebra/integral-sdk";
import { Info, SettingsIcon } from "lucide-react";
import { useState } from "react";

/* Info tooltip shown next to each setting label. */
const InfoTip = ({ text }: { text: string }) => (
    <HoverCard openDelay={80} closeDelay={40}>
        <HoverCardTrigger asChild>
            <span className="inline-flex text-text-300 hover:text-text-100 transition-colors cursor-help">
                <Info size={14} />
            </span>
        </HoverCardTrigger>
        <HoverCardContent className="max-w-[240px] p-3 text-sm font-normal leading-snug text-text-200">
            {text}
        </HoverCardContent>
    </HoverCard>
);

/* Label + info tooltip row used by every setting. */
const SettingLabel = ({ children, tip }: { children: React.ReactNode; tip: string }) => (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-text-100">
        <span>{children}</span>
        <InfoTip text={tip} />
    </div>
);

const Settings = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="p-2 text-text-200 hover:text-text-100 transition-colors bg-transparent border-none">
                    <SettingsIcon size={22} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align={"end"}
                sideOffset={8}
                className="flex flex-col gap-5 p-5 w-full max-w-[340px] rounded-2xl"
                style={{ background: "#1E1915", border: "1px solid #2F2823", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}
            >
                <div className="text-base font-bold text-text-100">Transaction Settings</div>
                <Separator orientation={"horizontal"} style={{ background: "#2F2823" }} />
                <SlippageTolerance />
                <TransactionDeadline />
                <Multihop />
                <SplitTrade />
                <ExpertMode />
            </PopoverContent>
        </Popover>
    );
};

const SlippageTolerance = () => {
    const {
        slippage,
        actions: { setSlippage },
    } = useUserState();

    const [slippageInput, setSlippageInput] = useState("");
    const [slippageError, setSlippageError] = useState<boolean>(false);

    function parseSlippageInput(value: string) {
        // populate what the user typed and clear the error
        setSlippageInput(value);
        setSlippageError(false);

        if (value.length === 0) {
            setSlippage("auto");
        } else {
            const parsed = Math.floor(Number.parseFloat(value) * 100);

            if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
                setSlippage("auto");
                if (value !== ".") {
                    setSlippageError(true);
                }
            } else {
                setSlippage(new Percent(parsed, 10_000));
            }
        }
    }

    const tooLow = slippage !== "auto" && slippage.lessThan(new Percent(5, 10_000));
    const tooHigh = slippage !== "auto" && slippage.greaterThan(new Percent(1, 100));

    const slippageString = slippage !== "auto" ? slippage.toFixed(2) : "auto";

    return (
        <div className="flex flex-col gap-2">
            <SettingLabel tip="Your transaction reverts if the price moves against you by more than this percentage between signing and execution.">
                Slippage Tolerance
            </SettingLabel>
            <div className="grid grid-cols-4 gap-3">
                <Button variant={slippageString === "auto" ? "iconActive" : "outline"} size={"sm"} onClick={() => parseSlippageInput("")}>
                    Auto
                </Button>
                <Button
                    variant={slippageString === "0.10" ? "iconActive" : "outline"}
                    size={"sm"}
                    onClick={() => parseSlippageInput("0.10")}
                >
                    0.1%
                </Button>
                <Button
                    variant={slippageString === "0.50" ? "iconActive" : "outline"}
                    size={"sm"}
                    onClick={() => parseSlippageInput("0.5")}
                >
                    0.5%
                </Button>
                <Button variant={slippageString === "1.00" ? "iconActive" : "outline"} size={"sm"} onClick={() => parseSlippageInput("1")}>
                    1%
                </Button>
                <div className="flex col-span-4">
                    <Input
                        value={slippageInput.length > 0 ? slippageInput : slippage === "auto" ? "" : slippage.toFixed(2)}
                        onChange={(e) => parseSlippageInput(e.target.value)}
                        onBlur={() => {
                            setSlippageInput("");
                            setSlippageError(false);
                        }}
                        className={`text-left border-none text-md font-semibold bg-card-hover rounded-l-lg rounded-r-none w-full min-w-[70px] ring-0!`}
                        placeholder={"0.0"}
                    />
                    <div className="bg-card-hover text-sm p-2 pt-2.5 rounded-r-lg select-none">%</div>
                </div>
            </div>
            {slippageError || tooLow || tooHigh ? (
                <div>
                    {slippageError ? (
                        <div className="bg-red-900 text-red-200 border border-red-500 px-2 py-1 rounded-lg">
                            Enter a valid slippage percentage
                        </div>
                    ) : (
                        <div className="bg-yellow-900 text-yellow-200 border border-yellow-500 px-2 py-1 rounded-lg">
                            {tooLow ? "Your transaction may fail" : "Your transaction may be frontrun"}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

const TransactionDeadline = () => {
    const {
        txDeadline,
        actions: { setTxDeadline },
    } = useUserState();

    const [deadlineInput, setDeadlineInput] = useState("");
    const [deadlineError, setDeadlineError] = useState<boolean>(false);

    function parseCustomDeadline(value: string) {
        setDeadlineInput(value);
        setDeadlineError(false);

        if (value.length === 0) {
            setTxDeadline(60 * 30);
        } else {
            try {
                const parsed: number = Math.floor(Number.parseFloat(value) * 60);
                if (!Number.isInteger(parsed) || parsed < 60 || parsed > 180 * 60) {
                    setDeadlineError(true);
                } else {
                    setTxDeadline(parsed);
                }
            } catch (error) {
                setDeadlineError(true);
            }
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <SettingLabel tip="Your transaction reverts if it stays pending longer than this many minutes.">
                Transaction Deadline
            </SettingLabel>
            <div className="flex">
                <Input
                    placeholder={"30"}
                    value={deadlineInput.length > 0 ? deadlineInput : txDeadline === 180 ? "" : (txDeadline / 60).toString()}
                    onChange={(e) => parseCustomDeadline(e.target.value)}
                    onBlur={() => {
                        setDeadlineInput("");
                        setDeadlineError(false);
                    }}
                    color={deadlineError ? "red" : ""}
                    className={`text-left border-none text-md font-semibold bg-card-hover rounded-l-lg rounded-r-none w-full ring-0!`}
                />
                <div className="bg-card-hover text-sm p-2 pt-2.5 rounded-r-lg select-none">minutes</div>
            </div>
        </div>
    );
};
const ExpertMode = () => {
    const {
        isExpertMode,
        actions: { setIsExpertMode },
    } = useUserState();

    return (
        <div className="flex justify-between items-center gap-2">
            <SettingLabel tip="Bypasses the swap confirmation and allows high-slippage trades. Use at your own risk.">
                Expert mode
            </SettingLabel>
            <Switch id="expert-mode" checked={isExpertMode} onCheckedChange={setIsExpertMode} />
        </div>
    );
};

const Multihop = () => {
    const {
        isMultihop,
        actions: { setIsMultihop },
    } = useUserState();

    return (
        <div className="flex justify-between items-center gap-2">
            <SettingLabel tip="Route trades through multiple liquidity pools to find a better price.">
                Multihop
            </SettingLabel>
            <Switch id="multihop" checked={isMultihop} onCheckedChange={setIsMultihop} />
        </div>
    );
};

const SplitTrade = () => {
    const {
        isSplit,
        actions: { setIsSplit },
    } = useUserState();

    return (
        <div className="flex justify-between items-center gap-2">
            <SettingLabel tip="Split a single trade across identical pools that use different plugins.">
                Split trade
            </SettingLabel>
            <Switch id="split" checked={isSplit} onCheckedChange={setIsSplit} />
        </div>
    );
};

export default Settings;
