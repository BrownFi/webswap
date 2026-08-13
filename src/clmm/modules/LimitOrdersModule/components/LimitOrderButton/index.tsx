import { Button } from "@clmm/components/ui/button";
import { useApprove } from "@clmm/hooks/common/useApprove";
import { useTransactionAwait } from "@clmm/hooks/common/useTransactionAwait";
import { IDerivedSwapInfo } from "@clmm/state/swapStore";
import { AnyToken, tryParseTick, POOL_DEPLOYER_ADDRESSES } from "@cryptoalgebra/integral-sdk";
import { useAccount } from "wagmi";
import { LIMIT_ORDER_MANAGER, DEFAULT_CHAIN_NAME, DEFAULT_CHAIN_ID } from "@clmm/config";
import { ApprovalState } from "@clmm/types/approve-state";
import Loader from "@clmm/components/common/Loader";
import { SwapField } from "@clmm/types/swap-field";
import { TransactionType } from "@clmm/state/pendingTransactionsStore";
import { Address } from "viem";
import { useWriteLimitOrderManagerPlace } from "@clmm/generated";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
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

    const { open } = useAppKit();

    const appChainId = DEFAULT_CHAIN_ID;

    const { chainId: userChainId } = useAppKitNetwork();

    const {
        currencies: { [SwapField.INPUT]: inputCurrency },
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

    // Approval gate uses useApprove's approvalState — its internal allowance query
    // polls every second, so after the approve tx confirms the button flips to
    // "Place an order" instead of looping on "Approve". Native input short-circuits
    // to APPROVED (no approval needed for ETH).
    const { approvalState, approvalCallback } = useApprove(inputAmount, LIMIT_ORDER_MANAGER[chainId]);

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
                          deployer: POOL_DEPLOYER_ADDRESSES[chainId],
                      },
                      limitOrder.tickLower,
                      zeroToOne,
                      BigInt(limitOrder.liquidity.toString()),
                  ] as const,
                  value: inputAmount?.currency.isNative ? BigInt(inputAmount.quotient.toString()) : BigInt(0),
              }
            : undefined;

    const { data: placeData, writeContract: placeLimitOrder, isPending } = useWriteLimitOrderManagerPlace();

    const { isLoading: isPlaceLoading } = useTransactionAwait(placeData, {
        type: TransactionType.LIMIT_ORDER,
        title: `Buy ${formatAmount(Number(inputAmount?.toSignificant()))} ${inputAmount?.currency.symbol}`,
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
                This pool doesn't support Limit Orders
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

    if (!disabled && approvalState === ApprovalState.NOT_APPROVED)
        return (
            <Button
                variant={"primary"}
                disabled={approvalState === ApprovalState.PENDING}
                onClick={() => approvalCallback && approvalCallback()}
            >
                {approvalState === ApprovalState.PENDING ? <Loader /> : `Approve ${inputAmount?.currency.symbol}`}
            </Button>
        );

    return (
        <Button
            variant={"primary"}
            disabled={disabled || isPlaceLoading || approvalState === ApprovalState.PENDING || isPending || !isReady}
            onClick={() => {
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
                    },
                    isReady && [
                        {
                            token0: token0.address as Address,
                            token1: token1.address as Address,
                        },
                        limitOrder.tickLower,
                        zeroToOne,
                        BigInt(limitOrder.liquidity.toString()),
                    ],
                );
                placeLimitOrderConfig && placeLimitOrder(placeLimitOrderConfig);
            }}
        >
            {isPlaceLoading || isPending ? <Loader /> : "Place an order"}
        </Button>
    );
};
