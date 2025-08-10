/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query MyQuery {\n    pairs(where: {chainId: 80094}) {\n      items {\n        address\n        apr\n        bnhPrice\n        bnhReserve0\n        bnhReserve1\n        bnhTotalSupply\n        chainId\n        fee\n        feeDay\n        k\n        lambda\n        lpPrice\n        netPnL\n        protocolFee\n        reserve0\n        reserve0USD\n        reserve1\n        reserve1USD\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        totalSupply\n        totalTxn\n        tvl\n      }\n    }\n  }\n": typeof types.MyQueryDocument,
};
const documents: Documents = {
    "\n  query MyQuery {\n    pairs(where: {chainId: 80094}) {\n      items {\n        address\n        apr\n        bnhPrice\n        bnhReserve0\n        bnhReserve1\n        bnhTotalSupply\n        chainId\n        fee\n        feeDay\n        k\n        lambda\n        lpPrice\n        netPnL\n        protocolFee\n        reserve0\n        reserve0USD\n        reserve1\n        reserve1USD\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        totalSupply\n        totalTxn\n        tvl\n      }\n    }\n  }\n": types.MyQueryDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyQuery {\n    pairs(where: {chainId: 80094}) {\n      items {\n        address\n        apr\n        bnhPrice\n        bnhReserve0\n        bnhReserve1\n        bnhTotalSupply\n        chainId\n        fee\n        feeDay\n        k\n        lambda\n        lpPrice\n        netPnL\n        protocolFee\n        reserve0\n        reserve0USD\n        reserve1\n        reserve1USD\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        totalSupply\n        totalTxn\n        tvl\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyQuery {\n    pairs(where: {chainId: 80094}) {\n      items {\n        address\n        apr\n        bnhPrice\n        bnhReserve0\n        bnhReserve1\n        bnhTotalSupply\n        chainId\n        fee\n        feeDay\n        k\n        lambda\n        lpPrice\n        netPnL\n        protocolFee\n        reserve0\n        reserve0USD\n        reserve1\n        reserve1USD\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        totalSupply\n        totalTxn\n        tvl\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;