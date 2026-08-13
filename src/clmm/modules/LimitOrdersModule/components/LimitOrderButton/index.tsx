import { Button } from "@clmm/components/ui/button";
import { useApprove } from "@clmm/hooks/common/useApprove";
import { useTransactionAwait } from "@clmm/hooks/common/useTransactionAwait";
import { IDerivedSwapInfo, useSwapState } from "@clmm/state/swapStore";
import { AnyToken, tryParseTick, POOL_DEPLOYER_ADDRESSES, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { LIMIT_ORDER_MANAGER, DEFAULT_CHAIN_NAME, DEFAULT_CHAIN_ID } from "@clmm/config";
import { wNativeABI } from "@clmm/config/abis";
import { ApprovalState } from "@clmm/types/approve-state";
import Loader from "@clmm/components/common/Loader";
import { SwapField } from "@clmm/types/swap-field";
import { TransactionType } from "@clmm/state/pendingTransactionsStore";
import { Address, erc20Abi } from "viem";
import { useWriteLimitOrderManagerPlace } from "@clmm/generated";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLimitOrderInfo } from "../../hooks";
import { formatAmount } from "@clmm/utils";

interface LimitOrderButtonProps {
    derivedSwap: IDerivedSwapInfo;
    token0: AnyToken | undefined;
    token1: AnyToken | undefined;
    poolAddress: Address | undefined;
    disabled: boolean;
    sellPrice: string;
    wasInverted: boolean;
    tickSpacing: number | undefined;
    zeroToOne: boolean;
    limitOrderPlugin: boolean;
}

export const LimitOrderButton = ({
    derivedSwap,
    disabled,
    token0,
    token1,
    poolAddress,
    wasInverted,
    sellPrice,
    tickSpacing,
    zeroToOne,
    limitOrderPlugin,
}: LimitOrderButtonProps) => {
    const { address: account } = useAccount();

    const {
        actions: { typeInput, typeLimitOrderPrice },
    } = useSwapState();

    const { open } = useAppKit();

    const appChainId = DEFAULT_CHAIN_ID;

    const { chainId: userChainId } = useAppKitNetwork();

    const {
        currencies,
        currencyBalances,
        inputError,
        parsedAmounts: { [SwapField.INPUT]: inputAmount },
    } = derivedSwap;

    const isInverted = wasInverted === zeroToOne;
    const [baseToken, quoteToken] = isInverted ? [token1, token0] : [token0, token1];
    const limitOrderTick = tryParseTick(baseToken, quoteToken, sellPrice, tickSpacing);

    const limitOrder = useLimitOrderInfo(poolAddress, inputAmount, limitOrderTick);

    const chainId = DEFAULT_CHAIN_ID;

    const insufficientBalance = inputAmount && currencyBalances[SwapField.INPUT]?.lessThan(inputAmount.quotient.toString());

    // LimitOrderManager.place does NOT accept native ETH: it funds the order by
    // pulling token0 (WETH) from the payer via transferFrom in the mint callback
    // (msg.value is refunded). So for native input we must wrap ETH -> WETH first,
    // then approve WETH, then place with value=0. For WETH input we skip the wrap.
    const isNativeInput = !!inputAmount?.currency.isNative;

    // WETH amount the order needs (wrapped form of whatever the user typed).
    const wethAmount = useMemo(
        () => (inputAmount ? CurrencyAmount.fromRawAmount(inputAmount.currency.wrapped, inputAmount.quotient.toString()) : undefined),
        [inputAmount],
    );
    const wethAddress = wethAmount?.currency.address as Address | undefined;

    const { data: wethBalanceRaw } = useReadContract({
        address: wethAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: account ? [account] : undefined,
        query: { enabled: !!account && !!wethAddress },
    });
    const wethBalance = wethBalanceRaw ? BigInt(wethBalanceRaw.toString()) : 0n;

    const nativeInputAmount = isNativeInput && inputAmount ? BigInt(inputAmount.quotient.toString()) : 0n;
    const wrapAmount = nativeInputAmount > wethBalance ? nativeInputAmount - wethBalance : 0n;
    const needsWrap = isNativeInput && wrapAmount > 0n;

    // Approval is always for WETH (the token the manager pulls), never for native.
    const { approvalState, approvalCallback } = useApprove(wethAmount, LIMIT_ORDER_MANAGER[chainId]);

    const isReady =
        token0 &&
        token1 &&
        inputAmount &&
        limitOrder &&
        !disabled &&
        !inputError &&
        approvalState === ApprovalState.APPROVED &&
        !insufficientBalance &&
        BigInt(limitOrder.liquidity.toString()) > 0;

    const placeLimitOrderConfig =
        isReady && POOL_DEPLOYER_ADDRESSES[chainId]
            ? {
                  address: LIMIT_ORDER_MANAGER[chainId],
                  args: [
                      {
                          token0: token0.address as Address,
                          token1: token1.address as Address,
                          // Default Algebra pools are deployed with poolDeployer ==
                          // address(0) → integral-core PoolAddress uses the 2-address
                          // salt (keccak256(abi.encode(token0, token1))). Passing the
                          // non-zero pool deployer would switch it to the 3-address
                          // salt and compute a non-existent pool → place reverts.
                          deployer: "0x0000000000000000000000000000000000000000" as Address,
                      },
                      limitOrder.tickLower,
                      zeroToOne,
                      BigInt(limitOrder.liquidity.toString()),
                  ] as const,
                  value: BigInt(0),
              }
            : undefined;

    const { data: placeData, writeContract: placeLimitOrder, isPending } = useWriteLimitOrderManagerPlace();

    // Multi-step flow: wrap -> approve -> place. Each step auto-advances once the
    // previous tx confirms, so a native order needs only the initial click.
    const { data: wrapHash, writeContract: wrapEth, isPending: wrapPending } = useWriteContract();
    const { isSuccess: wrapSuccess } = useWaitForTransactionReceipt({ hash: wrapHash });

    // Wrap step gets its own toast too (approve + place already do), so every
    // prompt in the wrap → approve → place chain is visible in the UI.
    useTransactionAwait(wrapHash, {
        type: TransactionType.LIMIT_ORDER,
        title: `Wrap ${formatAmount(Number(inputAmount?.toSignificant()))} ${inputAmount?.currency.symbol} to WETH`,
    });

    const [step, setStep] = useState<"idle" | "wrap" | "approve" | "place">("idle");
    const firedStepRef = useRef<"idle" | "wrap" | "approve" | "place">("idle");

    useEffect(() => {
        if (step !== "wrap" || !wrapSuccess || firedStepRef.current === "wrap") return;
        firedStepRef.current = "wrap";
        if (approvalState === ApprovalState.NOT_APPROVED) {
            setStep("approve");
            approvalCallback?.();
        } else {
            setStep("place");
            if (placeLimitOrderConfig) placeLimitOrder(placeLimitOrderConfig);
        }
    }, [step, wrapSuccess, approvalState, approvalCallback, placeLimitOrder, placeLimitOrderConfig]);

    useEffect(() => {
        if (step !== "approve" || approvalState !== ApprovalState.APPROVED || firedStepRef.current === "approve") return;
        firedStepRef.current = "approve";
        setStep("place");
        if (placeLimitOrderConfig) placeLimitOrder(placeLimitOrderConfig);
    }, [step, approvalState, placeLimitOrder, placeLimitOrderConfig]);

    const { isLoading: isPlaceLoading } = useTransactionAwait(placeData, {
        type: TransactionType.LIMIT_ORDER,
        title: `Place limit order: sell ${formatAmount(Number(inputAmount?.toSignificant()))} ${inputAmount?.currency.symbol} for ${currencies[SwapField.OUTPUT]?.symbol}`,
        callback: () => {
            typeInput(SwapField.INPUT, "");
            typeLimitOrderPrice("");
            setStep("idle");
            firedStepRef.current = "idle";
        },
    });

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account)
        return (
            <Button variant={"primary"} onClick={() => open()}>
                Connect Wallet
            </Button>
        );

    if (isWrongChain)
        return (
            <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>
                {`Connect to ${DEFAULT_CHAIN_NAME}`}
            </Button>
        );

    if (!limitOrderPlugin)
        return (
            <Button variant={"primary"} disabled>
                No direct pool for this pair — limit orders are single-pool
            </Button>
        );

    if (!disabled && inputError)
        return (
            <Button variant={"primary"} disabled>
                {inputError}
            </Button>
        );

    if (insufficientBalance) {
        return (
            <Button variant={"primary"} disabled>
                Insufficient {inputAmount.currency.symbol} amount
            </Button>
        );
    }

    const isBusy =
        step === "wrap" || wrapPending || step === "approve" || approvalState === ApprovalState.PENDING || isPlaceLoading || isPending;

    const needsApprove = !needsWrap && approvalState === ApprovalState.NOT_APPROVED;

    const label =
        step === "wrap"
            ? "Wrapping ETH..."
            : step === "approve" || approvalState === ApprovalState.PENDING
            ? "Approving WETH..."
            : isPlaceLoading || isPending
            ? "Placing order..."
            : needsWrap
            ? "Wrap & Place order"
            : needsApprove
            ? `Approve ${wethAmount?.currency.symbol || "WETH"}`
            : "Place an order";

    const handleClick = () => {
        if (needsWrap) {
            firedStepRef.current = "idle";
            setStep("wrap");
            wrapEth({ address: wethAddress as Address, abi: wNativeABI, functionName: "deposit", value: wrapAmount });
        } else if (needsApprove) {
            firedStepRef.current = "idle";
            setStep("approve");
            approvalCallback?.();
        } else {
            console.log(
                "[PLACE LIMIT ORDER]",
                {
                    token0,
                    token1,
                    inputAmount,
                    limitOrder,
                    disabled,
                    inputError,
                    approvalState,
                    step,
                },
                isReady && [
                    {
                        token0: token0.address as Address,
                        token1: token1.address as Address,
                        deployer: "0x0000000000000000000000000000000000000000" as Address,
                    },
                    limitOrder.tickLower,
                    zeroToOne,
                    BigInt(limitOrder.liquidity.toString()),
                ],
            );
            placeLimitOrder(placeLimitOrderConfig);
        }
    };

    const canClick = !disabled && (needsWrap || needsApprove || isReady);

    return (
        <Button variant={"primary"} disabled={!canClick || isBusy} onClick={handleClick}>
            {isBusy ? <Loader /> : label}
        </Button>
    );
};
