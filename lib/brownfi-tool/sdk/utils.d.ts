import JSBI from 'jsbi';
import { BigintIsh, SolidityType, ChainId } from './constants';
import { Pair } from './entities';
export declare function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void;
export declare function validateAndParseAddress(address: string, chainId: ChainId): string;
export declare function parseBigintIsh(bigintIsh: BigintIsh): JSBI;
export declare function sqrt(y: JSBI): JSBI;
export declare function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null;
export declare function supportContractWithPrice(chainId: ChainId): boolean;
export declare function isRouterV2(chainId: ChainId): boolean;
export declare function isTestnetSkipAmountsMin(chainId: ChainId): boolean;
/**
 * Use when AddLiquidity v2 - Arbitrum Sepolia, Arbitrum One
 */
export declare const getPythPrice: (address?: string | undefined, chainId?: ChainId | undefined) => Promise<number>;
export declare const getPythPricePair: (pair?: Pair | undefined, chainId?: ChainId | undefined) => Promise<number[]>;
export declare const getDataBytes: (chainId: ChainId, addresses: Array<string | undefined>) => Promise<string[]>;
export declare const solidityPack: (chainId: ChainId, addresses: Array<string | undefined>) => Promise<string>;
