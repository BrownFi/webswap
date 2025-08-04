import JSBI from 'jsbi';
import { BigintIsh, SolidityType, ChainId } from './constants';
import { Pair } from './entities';
export declare function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void;
export declare function validateAndParseAddress(address: string, chainId: ChainId): string;
export declare function parseBigintIsh(bigintIsh: BigintIsh): JSBI;
export declare function sqrt(y: JSBI): JSBI;
export declare function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null;
export declare function isContractWithPrice(chainId: ChainId, version: number): boolean;
export declare function getRouterAddress(chainId: number, version: number): any;
export declare function getFactoryAddress(chainId: number, version: number): any;
export declare function getInitCodeHash(chainId: number, version: number): any;
/**
 * Use when AddLiquidity v2 - Arbitrum Sepolia, Arbitrum One
 */
export declare const getPythPrice: (address: string, chainId: ChainId, version: number) => Promise<number>;
export declare const getPythPricePair: (pair?: Pair | undefined, chainId?: ChainId | undefined) => Promise<number[]>;
export declare const getPriceFromUnsafe: (priceUnsafe: string[]) => number;
export declare const getDataBytes: (addresses: Array<string | undefined>, chainId: ChainId) => Promise<string[]>;
export declare const solidityPack: (addresses: Array<string | undefined>, chainId: ChainId) => Promise<string>;
