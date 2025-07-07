import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { CurrencyAmount, JSBI } from '../sdk';
/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export default function isZero(hexNumberString: string): boolean;
export declare function calculateGasMargin(value: BigNumber): BigNumber;
export declare function isAddress(value: any): string | false;
export declare function shortenAddress(address: string, chars?: number): string;
export declare function getSigner(library: Web3Provider, account: string): JsonRpcSigner;
export declare function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner;
export declare function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract;
export declare function getRouterContract(chainId: number, library: Web3Provider, account: string, version: number): Contract;
export declare function getRouterContractWithPrice(chainId: number, library: Web3Provider, account?: string): Contract;
export declare function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI];
export declare function applySlippageNumber(value: BigNumber, slippage: number): BigNumber;
export declare function applySlippageCurrency(value: CurrencyAmount, slippage: number): CurrencyAmount;
