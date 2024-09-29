import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ChainId, SwapParameters, Trade } from '../sdk';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
export declare enum SwapCallbackState {
    INVALID = 0,
    LOADING = 1,
    VALID = 2
}
export interface SwapCall {
    contract: Contract;
    parameters: SwapParameters;
}
export interface SuccessfulCall {
    call: SwapCall;
    gasEstimate: BigNumber;
}
export interface FailedCall {
    call: SwapCall;
    error: Error;
}
export declare type EstimatedSwapCall = SuccessfulCall | FailedCall;
export declare const callSwapContractStarknet: (chainId: ChainId, library: any, account: string, trade: Trade, allowedSlippage: number, deadline: BigNumber) => Promise<TransactionResponse>;
export declare function callSwapContract(trade: Trade, account: string, allowedSlippage: number, recipient: string, chainId: number, library: Web3Provider, deadline: BigNumber): Promise<TransactionResponse>;
