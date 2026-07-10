import { DEFAULT_CHAIN_ID } from "@clmm/config";
import Loader from "@clmm/components/common/Loader";
import { Button } from "@clmm/components/ui/button";
import { DEFAULT_CHAIN_NAME, enabledModules, OMEGA_ROUTER } from "@clmm/config";
import useWrapCallback, { WrapType } from "@clmm/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, useSwapState } from "@clmm/state/swapStore";
import { useUserState } from "@clmm/state/userStore";
import { SwapField } from "@clmm/types/swap-field";
import { warningSeverity } from "@clmm/utils/swap/prices";
import { useCallback, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { tryParseAmount, BoostedRouteStepType } from "@cryptoalgebra/integral-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useApproveCallbackFromTrade } from "@clmm/hooks/common/useApprove";
import { ApprovalState } from "@clmm/types/approve-state";
import { useSwapCallback } from "@clmm/hooks/swap/useSwapCallback";
import { TradeState } from "@clmm/types/trade-state";

import SmartRouterModule from "@clmm/modules/SmartRouterModule";
const { useSmartRouterCallback } = SmartRouterModule.hooks;

import BoostedPoolsModule from "@clmm/modules/BoostedPoolsModule";
const { useOmegaSwapCallback, usePermit2 } = BoostedPoolsModule.hooks;

export enum AllowanceState {
    LOADING = 0,
    REQUIRED = 1,
    ALLOWED = 2,
}

const SwapButton = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const { open } = useAppKit();

    const appChainId = DEFAULT_CHAIN_ID;

    const { chainId: userChainId } = useAppKitNetwork();

    const { address: account } = useAccount();

    const { isExpertMode } = useUserState();

    const {
        independentField,
        typedValue,
        actions: { typeInput },
    } = useSwapState();
    const {
        allowedSlippage,
        parsedAmount,
        currencies,
        inputError: swapInputError,
        currencyBalances,
        toggledTrade: trade,
        tradeState,
        smartTradeCallOptions,
        refetchBalances,
    } = derivedSwap;

    const isSmartTrade = trade && "routes" in trade;

    const erc4626WrapType = useMemo(() => {
        if (isSmartTrade || !trade || !trade.swaps[0].route.isBoosted) return null;

        const steps = trade.swaps[0].route.steps;
        // Only pure wrap/unwrap if there's exactly one step and it's WRAP or UNWRAP
        if (steps.length === 1) {
            if (steps[0].type === BoostedRouteStepType.WRAP) return BoostedRouteStepType.WRAP;
            if (steps[0].type === BoostedRouteStepType.UNWRAP) return BoostedRouteStepType.UNWRAP;
        }
        return null;
    }, [trade, isSmartTrade]);

    const parsedAmountA =
        independentField === SwapField.INPUT
            ? parsedAmount
            : tryParseAmount(trade?.inputAmount?.toSignificant(), trade?.inputAmount?.currency);

    const parsedAmountB =
        independentField === SwapField.OUTPUT
            ? parsedAmount
            : tryParseAmount(trade?.outputAmount?.toSignificant(), trade?.outputAmount?.currency);

    const parsedAmounts = useMemo(
        () => ({
            [SwapField.INPUT]: parsedAmountA,
            [SwapField.OUTPUT]: parsedAmountB,
        }),
        [parsedAmountA, parsedAmountB],
    );

    const userHasSpecifiedInputOutput = Boolean(
        currencies[SwapField.INPUT] &&
            currencies[SwapField.OUTPUT] &&
            independentField !== SwapField.LIMIT_ORDER_PRICE &&
            parsedAmounts[independentField]?.greaterThan("0"),
    );

    const isLoadingRoute = tradeState.state === TradeState.LOADING;
    const routeNotFound = !trade;
    const insufficientBalance =
        currencyBalances[SwapField.INPUT] &&
        trade?.inputAmount &&
        currencyBalances[SwapField.INPUT]?.lessThan(trade.inputAmount.quotient.toString());

    const chainId = DEFAULT_CHAIN_ID;

    const shouldUseOmegaRouter = enabledModules.BoostedPoolsModule;

    const inputAmount = useMemo(() => {
        if (!trade || !shouldUseOmegaRouter || isSmartTrade) return undefined;
        const maxAmount = trade.maximumAmountIn(allowedSlippage);
        // Permit2 doesn't work with native currency
        if (!maxAmount || maxAmount.currency.isNative) return undefined;
        return maxAmount;
    }, [trade, allowedSlippage, shouldUseOmegaRouter, isSmartTrade]);

    const permit2Allowance = usePermit2({
        amount: inputAmount,
        spender: OMEGA_ROUTER[chainId], // OmegaRouter address (Permit2 spender)
    });

    // Use standard ERC20 approve for native/smart router (not boosted routes)
    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(!shouldUseOmegaRouter ? trade : null, allowedSlippage);

    const priceImpact = useMemo(() => {
        if (!trade) return undefined;

        /* trade.priceImpact and SmartRouter.getPriceImpact both compute Percent
         * from on-chain state; very thin pools, zero-liquidity, or stale data
         * can throw inside the JSBI math. Treat failure as "no data" rather
         * than letting it bubble and crash the button. */
        try {
            if (isSmartTrade) {
                return SmartRouter.getPriceImpact(trade);
            } else {
                return trade.priceImpact;
            }
        } catch {
            return undefined;
        }
    }, [trade, isSmartTrade]);

    const priceImpactSeverity = useMemo(() => {
        if (!priceImpact) return 0;
        /* warningSeverity walks IMPACT_TIERS with Percent.lessThan, which can
         * throw on malformed fractions. Default to "no warning" on error so a
         * valid trade isn't blocked by a calc glitch. */
        try {
            return warningSeverity(priceImpact);
        } catch {
            return 0;
        }
    }, [priceImpact]);

    const permitSignature = permit2Allowance.state === AllowanceState.ALLOWED ? permit2Allowance.permitSignature : undefined;
    const refetchPermit2Data = permit2Allowance.state !== AllowanceState.LOADING ? permit2Allowance.refetchPermit2Data : undefined;

    // Check if we need approval or permit signature (ONLY for OmegaRouter/boosted routes)
    const needsApprovalOrPermit =
        shouldUseOmegaRouter &&
        permit2Allowance.state === AllowanceState.REQUIRED &&
        (permit2Allowance.needsSetupApproval || permit2Allowance.needsPermitSignature);

    const onTransactionSuccess = useCallback(() => {
        refetchBalances();
        /* Clear the typed amount so the form resets after a confirmed swap.
         * Matches user expectation that the input/output fields don't keep
         * the consumed amount displayed once the tx lands. */
        typeInput(independentField, "");
        if (shouldUseOmegaRouter) {
            refetchPermit2Data?.();
        }
    }, [refetchBalances, refetchPermit2Data, shouldUseOmegaRouter, typeInput, independentField]);

    const { wrapType, execute: onWrap, loading: isWrapLoading, inputError: wrapInputError } = useWrapCallback(
        currencies[SwapField.INPUT],
        currencies[SwapField.OUTPUT],
        typedValue,
        onTransactionSuccess,
    );

    const showWrap = wrapType !== WrapType.NOT_APPLICABLE;

    const { callback: smartSwapCallback, isLoading: smartSwapLoading } = useSmartRouterCallback(
        trade?.inputAmount?.currency,
        trade?.outputAmount?.currency,
        trade?.inputAmount?.toFixed(),
        smartTradeCallOptions.calldata,
        smartTradeCallOptions.value,
        onTransactionSuccess,
    );

    // Use OmegaRouter callback for boosted routes and Permit2-signed swaps
    const { callback: omegaSwapCallback, isLoading: omegaSwapLoading, error: omegaSwapError } = useOmegaSwapCallback(
        shouldUseOmegaRouter && !isSmartTrade ? (!needsApprovalOrPermit ? trade : null) : null,
        allowedSlippage,
        permitSignature,
        onTransactionSuccess,
    );

    // Use regular SwapRouter callback for normal routes without Permit2.
    // Only pass the trade to useSwapCallback once allowance is granted; otherwise
    // we don't want to generate swap calldata.
    const tradePassedToSwap = !isSmartTrade && !shouldUseOmegaRouter ? (approvalState === ApprovalState.APPROVED ? trade : null) : null;
    const { callback: swapCallback, isLoading: swapLoading, error: swapError } = useSwapCallback(
        tradePassedToSwap,
        allowedSlippage,
        onTransactionSuccess,
    );

    const isSwapLoading = swapLoading || smartSwapLoading || omegaSwapLoading;
    const activeSwapError = shouldUseOmegaRouter ? omegaSwapError : swapError;

    const handleSwap = useCallback(async () => {
        if (!swapCallback && !smartSwapCallback && !omegaSwapCallback) return;
        try {
            if (isSmartTrade) {
                await smartSwapCallback?.();
            } else if (shouldUseOmegaRouter) {
                await omegaSwapCallback?.();
                if (permit2Allowance.state === AllowanceState.ALLOWED) {
                    permit2Allowance.removePermitSign();
                }
            } else {
                await swapCallback?.();
            }
        } catch (error) {
            return new Error(`Swap Failed ${error}`);
        }
    }, [swapCallback, smartSwapCallback, omegaSwapCallback, isSmartTrade, shouldUseOmegaRouter, permit2Allowance]);

    const isValid = !swapInputError && !activeSwapError;

    const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

    // Check if we need standard ERC20 approval (for native/smart router)
    const needsClassicApproval = !shouldUseOmegaRouter && approvalState === ApprovalState.NOT_APPROVED;
    const isApproving = approvalState === ApprovalState.PENDING;

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account)
        return (
            <Button variant={"primary"} onClick={() => open()}>
                Connect Wallet
            </Button>
        );

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    if (showWrap && wrapInputError) return <Button disabled>{wrapInputError}</Button>;

    if (showWrap)
        return (
            <Button variant={"primary"} onClick={() => onWrap && onWrap()}>
                {isWrapLoading ? <Loader /> : wrapType === WrapType.WRAP ? "Wrap" : "Unwrap"}
            </Button>
        );

    if (routeNotFound && userHasSpecifiedInputOutput)
        return (
            <Button variant={"primary"} disabled>
                {isLoadingRoute ? <Loader /> : "Insufficient liquidity for this trade."}
            </Button>
        );

    if (trade && insufficientBalance) {
        return (
            <Button variant={"primary"} disabled>
                {isLoadingRoute ? <Loader /> : `Insufficient ${trade.inputAmount.currency.symbol} amount`}
            </Button>
        );
    }

    // Show standard ERC20 approval button for native/smart router
    if (needsClassicApproval || isApproving) {
        return (
            <Button variant={"primary"} onClick={approvalCallback} disabled={isApproving}>
                {isApproving ? <Loader /> : `Approve ${trade?.inputAmount.currency.symbol}`}
            </Button>
        );
    }

    // Show approval or permit button (for OmegaRouter/boosted routes)
    if (needsApprovalOrPermit) {
        const {
            needsSetupApproval,
            needsPermitSignature,
            approveAndPermit,
            token,
            isLoading: isPermitOrApprovalLoading,
        } = permit2Allowance;

        if (needsSetupApproval && needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={approveAndPermit} disabled={isPermitOrApprovalLoading}>
                    {isPermitOrApprovalLoading ? <Loader /> : "Approve & Sign Permit"}
                </Button>
            );
        }

        if (needsSetupApproval) {
            return (
                <Button variant={"primary"} onClick={permit2Allowance.approve} disabled={isPermitOrApprovalLoading}>
                    {isPermitOrApprovalLoading ? <Loader /> : `Approve ${token.symbol}`}
                </Button>
            );
        }

        if (needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={permit2Allowance.permit} disabled={isPermitOrApprovalLoading}>
                    {isPermitOrApprovalLoading ? <Loader /> : "Sign Permit"}
                </Button>
            );
        }
    }

    return (
        <>
            <Button
                variant={"primary"}
                onClick={() => handleSwap()}
                disabled={
                    !isValid || priceImpactTooHigh || isSwapLoading || isLoadingRoute || needsApprovalOrPermit || needsClassicApproval
                }
            >
                {isSwapLoading ? (
                    <Loader />
                ) : priceImpactTooHigh ? (
                    "Price Impact Too High"
                ) : priceImpactSeverity > 2 ? (
                    "Swap Anyway"
                ) : swapInputError || activeSwapError ? (
                    swapInputError || activeSwapError
                ) : erc4626WrapType === BoostedRouteStepType.WRAP ? (
                    "Wrap"
                ) : erc4626WrapType === BoostedRouteStepType.UNWRAP ? (
                    "Unwrap"
                ) : (
                    "Swap"
                )}
            </Button>
        </>
    );
};

export default SwapButton;
