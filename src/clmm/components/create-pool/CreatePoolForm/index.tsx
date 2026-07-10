import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { Button } from "@clmm/components/ui/button";
import { useDerivedSwapInfo, useSwapState } from "@clmm/state/swapStore";
import { useEffect, useMemo, useState } from "react";
import { SwapField } from "@clmm/types/swap-field";
import {
    computePoolAddress,
    computeCustomPoolAddress,
    NonfungiblePositionManager,
    INITIAL_POOL_FEE,
} from "@cryptoalgebra/integral-sdk";
import { useTransactionAwait } from "@clmm/hooks/common/useTransactionAwait";
import { useAccount, useChainId } from "wagmi";
import { useDerivedMintInfo, useMintState } from "@clmm/state/mintStore";
import Loader from "@clmm/components/common/Loader";
import { PoolState, usePool } from "@clmm/hooks/pools/usePool";
import Summary from "../Summary";
import SelectPair from "../SelectPair";
import { TOKENS, CUSTOM_POOL_DEPLOYER_TITLES, CUSTOM_POOL_DEPLOYER_ADDRESSES, NONFUNGIBLE_POSITION_MANAGER, enabledModules } from "@clmm/config";
import { TransactionType } from "@clmm/state/pendingTransactionsStore";
import FixBrokenPool from "../FixBrokenPool";
import { Address } from "viem";
import { useWriteAlgebraCustomPoolEntryPointCreateCustomPool, useWriteNonfungiblePositionManagerMulticall } from "@clmm/generated";
import { cn, isDefined } from "@clmm/utils";

type PoolDeployerType = typeof CUSTOM_POOL_DEPLOYER_TITLES[keyof typeof CUSTOM_POOL_DEPLOYER_TITLES];

const CreatePoolForm = () => {
    const { address: account } = useAccount();

    const { currencies } = useDerivedSwapInfo();

    const {
        actions: { selectCurrency },
    } = useSwapState();

    const {
        startPriceTypedValue,
        actions: { typeStartPriceInput },
    } = useMintState();

    const chainid = DEFAULT_CHAIN_ID;

    const [poolDeployer, setPoolDeployer] = useState<PoolDeployerType>(CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC);

    const currencyA = currencies[SwapField.INPUT];
    const currencyB = currencies[SwapField.OUTPUT];

    const areCurrenciesSelected = currencyA && currencyB;

    const isSameToken = areCurrenciesSelected && currencyA.wrapped.equals(currencyB.wrapped);

    const customPoolDeployerAddresses = useMemo(
        () => ({
            [CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC]: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_DYNAMIC[chainid],
            [CUSTOM_POOL_DEPLOYER_TITLES.BASE_03]: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_03[chainid],
            [CUSTOM_POOL_DEPLOYER_TITLES.BASE_1]: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_1[chainid],
            [CUSTOM_POOL_DEPLOYER_TITLES.ALL_INCLUSIVE]: CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainid],
        }),
        [chainid]
    );

    const poolAddress =
        areCurrenciesSelected && !isSameToken
            ? (computePoolAddress({
                  tokenA: currencyA.wrapped,
                  tokenB: currencyB.wrapped,
              }) as Address)
            : undefined;

    const customPoolsAddresses =
        enabledModules.CustomPoolsModule && areCurrenciesSelected && !isSameToken
            ? [
                CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainid], 
                CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_03[chainid],
                CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_1[chainid]
            ].filter(isDefined).map(
                  (customPoolDeployer) =>
                      computeCustomPoolAddress({
                          tokenA: currencyA.wrapped,
                          tokenB: currencyB.wrapped,
                          customPoolDeployer,
                      }) as Address
              )
            : [];

    const [poolState] = usePool(poolAddress);

    // TODO
    // All Inclusive
    const [poolState0] = usePool(customPoolsAddresses[0]);
    // Base 0.3%
    const [poolState1] = usePool(customPoolsAddresses[1]);
    // Base 1%
    const [poolState2] = usePool(customPoolsAddresses[2]);

    const isPoolExists = poolState === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC;
    const isPool0Exists = poolState0 === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.ALL_INCLUSIVE;
    const isPool1Exists = poolState1 === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_03;
    const isPool2Exists = poolState2 === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_1;

    const isSelectedCustomPoolExists = isPoolExists || isPool0Exists || isPool1Exists || isPool2Exists;

    const mintInfo = useDerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        poolAddress ?? undefined,
        INITIAL_POOL_FEE,
        currencyA ?? undefined,
        undefined
    );

    const { calldata, value } = useMemo(() => {
        if (!mintInfo?.pool || !customPoolDeployerAddresses[poolDeployer])
            return {
                calldata: undefined,
                value: undefined,
            };

        return NonfungiblePositionManager.createCallParameters(mintInfo.pool, customPoolDeployerAddresses[poolDeployer]);
    }, [customPoolDeployerAddresses, mintInfo.pool, poolDeployer]);

    const { data: createBasePoolData, writeContract: createBasePool, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const createBasePoolConfig = calldata
        ? {
              address: NONFUNGIBLE_POSITION_MANAGER[chainid],
              args: Array.isArray(calldata) ? ([calldata as Address[]] as const) : ([[calldata] as Address[]] as const),
              value: BigInt(value || 0),
              enabled: Boolean(calldata),
          }
        : null;

    const { isLoading: isBasePoolLoading } = useTransactionAwait(
        createBasePoolData,
        {
            title: "Create Base Pool",
            tokenA: currencyA?.wrapped.address as Address,
            tokenB: currencyB?.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        "/clmm/pools"
    );

    const isCustomPoolDeployerReady = account && mintInfo.pool && poolDeployer !== CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC;

    const createCustomPoolConfig =
        isCustomPoolDeployerReady && customPoolDeployerAddresses[poolDeployer]
            ? {
                  address: customPoolDeployerAddresses[poolDeployer],
                  args: [
                      account,
                      mintInfo.pool?.token0.address as Address,
                      mintInfo.pool?.token1.address as Address,
                      "0x0",
                  ] as const,
              }
            : undefined;

    const { data: createCustomPoolData, writeContract: createCustomPool } = useWriteAlgebraCustomPoolEntryPointCreateCustomPool();

    const { isLoading: isCustomPoolLoading } = useTransactionAwait(createCustomPoolData, {
        title: "Create Custom Pool",
        tokenA: currencyA?.wrapped.address as Address,
        tokenB: currencyB?.wrapped.address as Address,
        type: TransactionType.POOL,
    });

    const isLoading = isCustomPoolLoading || isBasePoolLoading || isPending || mintInfo.poolState === PoolState.LOADING;

    useEffect(() => {
        selectCurrency(SwapField.INPUT, undefined);
        selectCurrency(SwapField.OUTPUT, undefined);
        typeStartPriceInput("");

        return () => {
            selectCurrency(SwapField.INPUT, TOKENS[chainid].HEMIBTC.address as Address);
            selectCurrency(SwapField.OUTPUT, TOKENS[chainid].USDC.address as Address);
            typeStartPriceInput("");
        };
    }, []);

    const handlePoolDeployerChange = (poolDeployer: PoolDeployerType) => {
        setPoolDeployer(poolDeployer);
    };

    const handleCreatePool = () => {
        if (poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC) {
            if (!createBasePool || !createBasePoolConfig) return;
            createBasePool(createBasePoolConfig);
            return;
        }
        if (!createCustomPoolConfig) return;
        createCustomPool(createCustomPoolConfig);
    };

    /* A pool type is selectable only if its deployer is configured for the
     * current chain. On Bera we have BASE_DYNAMIC (ADDRESS_ZERO = default
     * deployer) and ALL_INCLUSIVE (entryPoint from deploys.json); BASE_03 and
     * BASE_1 are null until deployed. ADDRESS_ZERO is a valid sentinel for
     * the default deployer, so we only filter out null/undefined. */
    const selectablePoolDeployers = useMemo(
        () =>
            Object.entries(CUSTOM_POOL_DEPLOYER_TITLES).filter(
                ([, title]) => customPoolDeployerAddresses[title] !== null && customPoolDeployerAddresses[title] !== undefined
            ) as [string, PoolDeployerType][],
        [customPoolDeployerAddresses]
    );

    /* Auto-fallback if the user is sitting on a pool type that isn't deployed
     * on the active chain (e.g. switched chains while form was open). */
    useEffect(() => {
        const stillValid = selectablePoolDeployers.some(([, title]) => title === poolDeployer);
        if (!stillValid && selectablePoolDeployers.length > 0) {
            setPoolDeployer(selectablePoolDeployers[0][1]);
        }
    }, [selectablePoolDeployers, poolDeployer]);

    const hasValidDeployer =
        customPoolDeployerAddresses[poolDeployer] !== null && customPoolDeployerAddresses[poolDeployer] !== undefined;

    /* For BASE_DYNAMIC: need createBasePoolConfig. For custom: need
     * createCustomPoolConfig. If neither is ready, the click is a no-op —
     * disable the button rather than letting it silently fail. */
    const isActionReady =
        poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC
            ? Boolean(createBasePoolConfig)
            : Boolean(createCustomPoolConfig);

    const isDisabled = Boolean(
        isLoading ||
            isSelectedCustomPoolExists ||
            !startPriceTypedValue ||
            !areCurrenciesSelected ||
            isSameToken ||
            isPending ||
            !mintInfo?.pool ||
            !hasValidDeployer ||
            !isActionReady
    );

    return (
        <div className="flex flex-col gap-2 p-3 bg-dark-gradient border border-card-border rounded-xl">
            <div className="text-left px-1">
                <div className="font-semibold">Pair &amp; initial price</div>
                <div className="text-xs text-text-300">
                    Pick the two tokens, then set how much of token B equals 1 token A.
                </div>
            </div>
            <SelectPair mintInfo={mintInfo} currencyA={currencyA} currencyB={currencyB} />

            {areCurrenciesSelected && !isSameToken && !isSelectedCustomPoolExists && (
                <Summary currencyA={currencyA} currencyB={currencyB} />
            )}

            {enabledModules.CustomPoolsModule ? (
                <div className="text-left bg-card-dark border border-card-border px-4 py-3 rounded-lg">
                    <div className="font-semibold">Pool type</div>
                    <div className="text-xs text-text-300 mb-3">Pick a fee tier. "Dynamic" adjusts the fee with volatility.</div>
                    <div className="grid grid-cols-2 w-full gap-2">
                        {selectablePoolDeployers.map(([, v]) => (
                            <Button
                                variant={poolDeployer === v ? "iconActive" : "outline"}
                                key={v}
                                onClick={() => handlePoolDeployerChange(v)}
                                className={cn("px-3 py-2 rounded-lg")}
                            >
                                {v}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : null}

            <Button variant={"primary"} className="mt-2" disabled={isDisabled} onClick={handleCreatePool}>
                {isLoading ? (
                    <Loader />
                ) : isSameToken ? (
                    "Select another pair"
                ) : !areCurrenciesSelected ? (
                    "Select currencies"
                ) : isSelectedCustomPoolExists ? (
                    "Pool already exists"
                ) : !startPriceTypedValue ? (
                    "Enter initial price"
                ) : (
                    "Create Pool"
                )}
            </Button>

            {poolDeployer !== CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC && (
                <Button
                    variant={"primary"}
                    disabled={isDisabled}
                    onClick={() => createBasePoolConfig && createBasePool(createBasePoolConfig)}
                    className="mt-2"
                >
                    {isCustomPoolLoading ? <Loader /> : "Initialize"}
                </Button>
            )}

            <FixBrokenPool currencyIn={currencyA} currencyOut={currencyB} deployer={customPoolDeployerAddresses[poolDeployer]} />
        </div>
    );
};

export default CreatePoolForm;
