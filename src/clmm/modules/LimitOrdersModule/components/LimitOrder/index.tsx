import { PoolState, usePool } from "@clmm/hooks/pools/usePool";
import { IDerivedSwapInfo, useSwapState } from "@clmm/state/swapStore";
import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { SwapField } from "@clmm/types/swap-field";
import { computeCustomPoolAddress, getTickToPrice, TickMath, tickToPrice, tryParseTick, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { LimitPriceCard } from "../LimitPriceCard";
import { LimitOrderButton } from "../LimitOrderButton";
import { CUSTOM_POOL_DEPLOYER_ADDRESSES } from "@clmm/config/custom-pool-deployer";

export const LimitOrder = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const { currencies } = derivedSwap;

    const singleHopOnly = false;

    const [initialSingleHop, setInitialSingleHop] = useState(singleHopOnly);

    const {
        actions: { typeLimitOrderPrice, limitOrderPriceLastFocused, limitOrderPriceWasInverted },
    } = useSwapState();

    const chainId = DEFAULT_CHAIN_ID;

    const tokenA = currencies[SwapField.INPUT]?.wrapped;
    const tokenB = currencies[SwapField.OUTPUT]?.wrapped;

    const showWrap = tokenA?.wrapped?.equals(WNATIVE[chainId]) && tokenB?.wrapped.equals(WNATIVE[chainId]);

    const [token0, token1] =
        tokenA && tokenB && !showWrap
            ? tokenA.wrapped?.sortsBefore(tokenB.wrapped)
                ? [tokenA, tokenB]
                : [tokenB, tokenA]
            : [undefined, undefined];

    const invertPrice = Boolean(currencies[SwapField.INPUT] && token0 && !currencies[SwapField.INPUT]?.wrapped.equals(token0));

    const zeroToOne = !invertPrice;

    const [wasInverted, setWasInverted] = useState(false);

    const limitOrderPoolAddress =
        token0 && token1 && !showWrap && CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_DYNAMIC[chainId]
            ? (computeCustomPoolAddress({
                  tokenA: token0,
                  tokenB: token1,
                  customPoolDeployer: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_DYNAMIC[chainId],
              }) as Address)
            : undefined;

    const [limitOrderPoolExists, limitOrderPool] = usePool(limitOrderPoolAddress);

    const initialSellPrice = useMemo(() => {
        if (!limitOrderPool) return "";

        const { tickCurrent, tickSpacing } = limitOrderPool;

        const targetTick = invertPrice
            ? Math.max(tickCurrent - tickSpacing, TickMath.MIN_TICK)
            : Math.min(tickCurrent + tickSpacing, TickMath.MAX_TICK);

        const _newPrice = invertPrice ? getTickToPrice(token1, token0, targetTick) : getTickToPrice(token0, token1, targetTick);

        return _newPrice?.toSignificant(8);
    }, [limitOrderPool, token0, token1, invertPrice]);

    const [sellPrice, setSellPrice] = useState("");

    const isPoolExists = limitOrderPoolExists === PoolState.EXISTS;

    const tick = limitOrderPool?.tickCurrent;
    const tickSpacing = limitOrderPool?.tickSpacing;

    const tickStep = useCallback(
        (direction: 1 | -1) => {
            if (!tickSpacing) return;

            const tick = invertPrice
                ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
                : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

            if (!token0 || !token1 || tick === undefined) {
                setSellPrice("");
                return;
            }

            const limitOrderPrice = invertPrice
                ? tickToPrice(token1, token0, tick + tickSpacing * direction * -1).toSignificant(8)
                : tickToPrice(token0, token1, tick + tickSpacing * direction).toSignificant(8);

            setSellPrice(limitOrderPrice);
            typeLimitOrderPrice(limitOrderPrice);
        },
        [invertPrice, token0, token1, sellPrice, tickSpacing, typeLimitOrderPrice],
    );
    const { blockCreation, message } = useMemo(() => {
        const missingFields: string[] = [];

        if (!currencies.INPUT) missingFields.push("currencies.INPUT");
        if (!currencies.OUTPUT) missingFields.push("currencies.OUTPUT");
        if (!token0) missingFields.push("token0");
        if (!token1) missingFields.push("token1");
        if (tick === undefined) missingFields.push("tick");
        if (tickSpacing === undefined) missingFields.push("tickSpacing");

        if (
            missingFields.length > 0 ||
            !token0 ||
            !token1 ||
            tick === undefined ||
            tickSpacing === undefined ||
            !currencies.INPUT ||
            !currencies.OUTPUT
        ) {
            return {
                blockCreation: true,
                message: `Missing required data to create order: ${missingFields.join(", ")}`,
            };
        }

        const priceTick = invertPrice
            ? wasInverted
                ? tryParseTick(token0, token1, sellPrice.toString(), tickSpacing)
                : tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
            : wasInverted
            ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
            : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

        if (priceTick === undefined) {
            return { blockCreation: true, message: "Unable to calculate price tick" };
        }

        if (currencies.INPUT.wrapped.equals(token0.wrapped) && priceTick <= tick) {
            return {
                blockCreation: true,
                message: "Sell price must be above current price when selling token0",
            };
        }

        if (currencies.INPUT.wrapped.equals(token1.wrapped) && priceTick >= tick) {
            return {
                blockCreation: true,
                message: "Sell price must be below current price when selling token1",
            };
        }

        return { blockCreation: false, message: "" };
    }, [token0, token1, currencies, invertPrice, sellPrice, tick, wasInverted, tickSpacing]);

    console.log("BLOCK", blockCreation, message);

    const [plusDisabled, minusDisabled] = useMemo(() => {
        if (!currencies.INPUT || !currencies.OUTPUT || !token0 || !token1 || !tick || !tickSpacing) return [true, true];

        const priceTick = invertPrice
            ? wasInverted
                ? tryParseTick(token0, token1, sellPrice.toString(), tickSpacing)
                : tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
            : wasInverted
            ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
            : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

        if (priceTick === undefined) return [true, true];

        if (currencies.INPUT.wrapped.equals(token0.wrapped) && priceTick - tickSpacing <= tick)
            return wasInverted ? [true, false] : [false, true];

        if (currencies.INPUT.wrapped.equals(token1.wrapped) && priceTick + tickSpacing >= tick - tickSpacing)
            return wasInverted ? [true, false] : [false, true];

        return [false, false];
    }, [token0, token1, currencies, invertPrice, sellPrice, tick, wasInverted, tickSpacing]);

    const handleSetSellPrice = useCallback(
        (value: string, invert = false) => {
            const tick = tryParseTick(token0, token1, value, tickSpacing);

            const newPrice = getTickToPrice(token0, token1, tick);

            if (!newPrice) {
                setSellPrice("");
                return;
            }

            const limitOrderPrice = invert ? newPrice.invert().toSignificant(8) : newPrice.toSignificant(8);

            setSellPrice(limitOrderPrice);
            typeLimitOrderPrice(limitOrderPrice);
        },
        [token0, token1, tickSpacing],
    );

    const setToMarketPrice = useCallback(
        (invert: boolean) => {
            if (!initialSellPrice) return;

            handleSetSellPrice(initialSellPrice, invert);
            limitOrderPriceLastFocused();
        },
        [initialSellPrice],
    );

    // Reset the limit price when the pair changes. The sellPrice state is otherwise
    // kept from the previous pair (the populate effect below only sets it when
    // empty) — a stale price like "0.029516" (from ETH→hemiBTC) parses to a tick
    // far below the WETH/USDC.e pool's current tick, tripping the "sell price must
    // be above current price" guard and disabling the place button.
    const inputWrappedAddress = currencies[SwapField.INPUT]?.wrapped?.address;
    const outputWrappedAddress = currencies[SwapField.OUTPUT]?.wrapped?.address;

    // MUST run before the populate effect below: when a pair change and the pool
    // load resolve in the SAME commit (e.g. the pool reads are already cached from
    // a previous selection), React runs effects in declaration order — if the clear
    // ran second it would wipe the freshly-populated sellPrice and the rate would
    // never show on a VUSD→USDC.e style transition.
    useEffect(() => {
        setSellPrice("");
        typeLimitOrderPrice("");
    }, [inputWrappedAddress, outputWrappedAddress]);

    useEffect(() => {
        if (initialSellPrice && !sellPrice) {
            setSellPrice(initialSellPrice);
            typeLimitOrderPrice(initialSellPrice);
        }
    }, [initialSellPrice, invertPrice]);

    useEffect(() => {
        setInitialSingleHop(singleHopOnly);

        return () => {
            typeLimitOrderPrice("");
            limitOrderPriceWasInverted(false);
        };
    }, [initialSingleHop]);

    return (
        <div className="flex flex-col gap-2">
            <LimitPriceCard
                currency={currencies[SwapField.INPUT]}
                otherCurrency={currencies[SwapField.OUTPUT]}
                sellPrice={sellPrice}
                invertTick={(value: string) => {
                    handleSetSellPrice(value, true);
                    setWasInverted(!wasInverted);
                    limitOrderPriceWasInverted(!wasInverted);
                }}
                setSellPrice={handleSetSellPrice}
                tickStep={tickStep}
                setToMarketPrice={setToMarketPrice}
                plusDisabled={plusDisabled}
                minusDisabled={minusDisabled}
                disabled={showWrap || !isPoolExists}
            />
            <LimitOrderButton
                derivedSwap={derivedSwap}
                disabled={blockCreation}
                limitOrderPlugin={isPoolExists}
                token0={token0}
                token1={token1}
                poolAddress={limitOrderPoolAddress}
                sellPrice={sellPrice}
                tickSpacing={tickSpacing}
                wasInverted={wasInverted}
                zeroToOne={zeroToOne}
            />
        </div>
    );
};
