import { ChainId, Token } from '../sdk';
import { SerializedPair } from '../constants/constants';
/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export declare function useGetListPairs(chainId: ChainId, tokens: {
    [address: string]: Token;
}, savedSerializedPairs: {
    [chainId: number]: {
        [key: string]: SerializedPair;
    };
}): [Token, Token][];
