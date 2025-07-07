import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Currency, CurrencyAmount, Percent, TokenAmount } from '../sdk';
import { ApprovalState, Field } from '../constants/constants';
import { AccountInterface } from 'starknet';
/** @deprecated */
export declare const addLiquidityStarket: (chainId: ChainId, library: AccountInterface | null | undefined, account: string | null | undefined, parsedAmountA: CurrencyAmount | undefined, parsedAmountB: CurrencyAmount | undefined, deadline: BigNumber | undefined) => Promise<TransactionResponse | undefined>;
export declare function addLiquidity(chainId: ChainId | undefined, library: Web3Provider | AccountInterface | undefined, account: string | null | undefined, parsedAmountA: CurrencyAmount | undefined, parsedAmountB: CurrencyAmount | undefined, exactFieldInput: Field | undefined, deadline: BigNumber | undefined, noLiquidity: boolean | undefined, allowedSlippage: number, version: number): Promise<TransactionResponse | undefined>;
export declare type ParsedAmounts = {
    LIQUIDITY_PERCENT: Percent;
    LIQUIDITY?: TokenAmount;
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
};
export declare type SignatureData = {
    v: number;
    r: string;
    s: string;
    deadline: number;
};
export declare function removeLiquidity(chainId: ChainId | undefined, library: Web3Provider | AccountInterface | undefined, account: string | null | undefined, parsedAmounts: ParsedAmounts, deadline: BigNumber | undefined, allowedSlippage: number, approval: ApprovalState, signatureData: SignatureData | null, version: number): Promise<any>;
