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
    "\n  query PairStats($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        netPnL\n      }\n    }\n  }\n": typeof types.PairStatsDocument,
    "\n  query PairStats2($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        bnhPrice2\n        netPnL\n      }\n    }\n  }\n": typeof types.PairStats2Document,
    "\n  query PairList($chainId: Int) {\n    pairs(where: {chainId: $chainId}) {\n      totalCount\n      items {\n        chainId\n        address\n        fee\n        totalSupply\n        reserve0\n        reserve1\n        tvl\n        apr\n        volumeDay\n        volume7Day\n        updatedAt\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n      }\n    }\n  }\n": typeof types.PairListDocument,
};
const documents: Documents = {
    "\n  query PairStats($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        netPnL\n      }\n    }\n  }\n": types.PairStatsDocument,
    "\n  query PairStats2($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        bnhPrice2\n        netPnL\n      }\n    }\n  }\n": types.PairStats2Document,
    "\n  query PairList($chainId: Int) {\n    pairs(where: {chainId: $chainId}) {\n      totalCount\n      items {\n        chainId\n        address\n        fee\n        totalSupply\n        reserve0\n        reserve1\n        tvl\n        apr\n        volumeDay\n        volume7Day\n        updatedAt\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n      }\n    }\n  }\n": types.PairListDocument,
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
export function gql(source: "\n  query PairStats($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        netPnL\n      }\n    }\n  }\n"): (typeof documents)["\n  query PairStats($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        netPnL\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PairStats2($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        bnhPrice2\n        netPnL\n      }\n    }\n  }\n"): (typeof documents)["\n  query PairStats2($chainId: Int, $address: String) {\n    pairDayDatas(\n      limit: 1000\n      where: {chainId: $chainId, address: $address}\n      orderBy: \"startUnix\"\n      orderDirection: \"asc\"\n    ) {\n      items {\n        chainId\n        address\n        startUnix\n        tvl\n        totalVolume\n        totalFee\n        apr\n        lpPrice\n        bnhPrice\n        bnhPrice2\n        netPnL\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PairList($chainId: Int) {\n    pairs(where: {chainId: $chainId}) {\n      totalCount\n      items {\n        chainId\n        address\n        fee\n        totalSupply\n        reserve0\n        reserve1\n        tvl\n        apr\n        volumeDay\n        volume7Day\n        updatedAt\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PairList($chainId: Int) {\n    pairs(where: {chainId: $chainId}) {\n      totalCount\n      items {\n        chainId\n        address\n        fee\n        totalSupply\n        reserve0\n        reserve1\n        tvl\n        apr\n        volumeDay\n        volume7Day\n        updatedAt\n        token0 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n        token1 {\n          address\n          chainId\n          decimals\n          name\n          price\n          priceFeedId\n          symbol\n          totalSupply\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;