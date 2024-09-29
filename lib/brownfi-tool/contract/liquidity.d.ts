import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Currency, CurrencyAmount, Percent, Token, TokenAmount } from '../sdk';
import { ApprovalState } from '../constants/constants';
import { AccountInterface } from 'starknet';
export declare const addLiquidityStarket: (chainId: ChainId, library: AccountInterface | null | undefined, account: string | null | undefined, parsedAmountA: CurrencyAmount | undefined, parsedAmountB: CurrencyAmount | undefined, deadline: BigNumber | undefined) => Promise<TransactionResponse | undefined>;
export declare function addLiquidity(chainId: ChainId | undefined, library: Web3Provider | AccountInterface | undefined, account: string | null | undefined, parsedAmountA: CurrencyAmount | undefined, parsedAmountB: CurrencyAmount | undefined, deadline: BigNumber | undefined, noLiquidity: boolean | undefined, allowedSlippage: number): Promise<TransactionResponse | undefined>;
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
export declare function removeLiquidity(chainId: ChainId | undefined, library: Web3Provider | AccountInterface | undefined, account: string | null | undefined, parsedAmounts: ParsedAmounts, deadline: BigNumber | undefined, allowedSlippage: number, approval: ApprovalState, signatureData: SignatureData | null): Promise<any>;
/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export declare function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token;
