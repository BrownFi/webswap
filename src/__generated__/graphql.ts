/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Meta = {
  __typename?: 'Meta';
  status?: Maybe<Scalars['JSON']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _meta?: Maybe<Meta>;
  accountData?: Maybe<AccountData>;
  accountDatas: AccountDataPage;
  accountDayData?: Maybe<AccountDayData>;
  accountDayDatas: AccountDayDataPage;
  factory?: Maybe<Factory>;
  factoryDayData?: Maybe<FactoryDayData>;
  factoryDayDatas: FactoryDayDataPage;
  factorys: FactoryPage;
  pair?: Maybe<Pair>;
  pairDayData?: Maybe<PairDayData>;
  pairDayDatas: PairDayDataPage;
  pairHourData?: Maybe<PairHourData>;
  pairHourDatas: PairHourDataPage;
  pairMinuteData?: Maybe<PairMinuteData>;
  pairMinuteDatas: PairMinuteDataPage;
  pairs: PairPage;
  token?: Maybe<Token>;
  tokens: TokenPage;
  transaction?: Maybe<Transaction>;
  transactions: TransactionPage;
};


export type QueryAccountDataArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Float']['input'];
};


export type QueryAccountDatasArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<AccountDataFilter>;
};


export type QueryAccountDayDataArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Float']['input'];
  startUnix: Scalars['Float']['input'];
};


export type QueryAccountDayDatasArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<AccountDayDataFilter>;
};


export type QueryFactoryArgs = {
  id: Scalars['Int']['input'];
};


export type QueryFactoryDayDataArgs = {
  id: Scalars['Float']['input'];
  startUnix: Scalars['Float']['input'];
};


export type QueryFactoryDayDatasArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<FactoryDayDataFilter>;
};


export type QueryFactorysArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<FactoryFilter>;
};


export type QueryPairArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Float']['input'];
};


export type QueryPairDayDataArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Float']['input'];
  startUnix: Scalars['Float']['input'];
};


export type QueryPairDayDatasArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PairDayDataFilter>;
};


export type QueryPairHourDataArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Float']['input'];
  startUnix: Scalars['Float']['input'];
};


export type QueryPairHourDatasArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PairHourDataFilter>;
};


export type QueryPairMinuteDataArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Float']['input'];
  startUnix: Scalars['Float']['input'];
};


export type QueryPairMinuteDatasArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PairMinuteDataFilter>;
};


export type QueryPairsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<PairFilter>;
};


export type QueryTokenArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Float']['input'];
};


export type QueryTokensArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<TokenFilter>;
};


export type QueryTransactionArgs = {
  chainId: Scalars['Float']['input'];
  hash: Scalars['String']['input'];
  pair: Scalars['String']['input'];
};


export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<TransactionFilter>;
};

export type AccountData = {
  __typename?: 'accountData';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
};

export type AccountDataFilter = {
  AND?: InputMaybe<Array<InputMaybe<AccountDataFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AccountDataFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type AccountDataPage = {
  __typename?: 'accountDataPage';
  items: Array<AccountData>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AccountDayData = {
  __typename?: 'accountDayData';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  startUnix: Scalars['Int']['output'];
};

export type AccountDayDataFilter = {
  AND?: InputMaybe<Array<InputMaybe<AccountDayDataFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AccountDayDataFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startUnix?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startUnix_lt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_lte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type AccountDayDataPage = {
  __typename?: 'accountDayDataPage';
  items: Array<AccountDayData>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Factory = {
  __typename?: 'factory';
  id: Scalars['Int']['output'];
  minPriceAge: Scalars['BigInt']['output'];
  totalAccount: Scalars['Int']['output'];
  totalFee: Scalars['Float']['output'];
  totalPair: Scalars['Int']['output'];
  totalVolume: Scalars['Float']['output'];
  tvl: Scalars['Float']['output'];
};

export type FactoryDayData = {
  __typename?: 'factoryDayData';
  id: Scalars['Int']['output'];
  startUnix: Scalars['Int']['output'];
  totalAccount: Scalars['Int']['output'];
  totalFee: Scalars['Float']['output'];
  totalVolume: Scalars['Float']['output'];
  tvl: Scalars['Float']['output'];
};

export type FactoryDayDataFilter = {
  AND?: InputMaybe<Array<InputMaybe<FactoryDayDataFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<FactoryDayDataFilter>>>;
  id?: InputMaybe<Scalars['Int']['input']>;
  id_gt?: InputMaybe<Scalars['Int']['input']>;
  id_gte?: InputMaybe<Scalars['Int']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id_lt?: InputMaybe<Scalars['Int']['input']>;
  id_lte?: InputMaybe<Scalars['Int']['input']>;
  id_not?: InputMaybe<Scalars['Int']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startUnix?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startUnix_lt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_lte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalAccount?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_gt?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_gte?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalAccount_lt?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_lte?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_not?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalFee?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalFee_lt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_lte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume_lt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl?: InputMaybe<Scalars['Float']['input']>;
  tvl_gt?: InputMaybe<Scalars['Float']['input']>;
  tvl_gte?: InputMaybe<Scalars['Float']['input']>;
  tvl_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl_lt?: InputMaybe<Scalars['Float']['input']>;
  tvl_lte?: InputMaybe<Scalars['Float']['input']>;
  tvl_not?: InputMaybe<Scalars['Float']['input']>;
  tvl_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type FactoryDayDataPage = {
  __typename?: 'factoryDayDataPage';
  items: Array<FactoryDayData>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type FactoryFilter = {
  AND?: InputMaybe<Array<InputMaybe<FactoryFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<FactoryFilter>>>;
  id?: InputMaybe<Scalars['Int']['input']>;
  id_gt?: InputMaybe<Scalars['Int']['input']>;
  id_gte?: InputMaybe<Scalars['Int']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id_lt?: InputMaybe<Scalars['Int']['input']>;
  id_lte?: InputMaybe<Scalars['Int']['input']>;
  id_not?: InputMaybe<Scalars['Int']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  minPriceAge?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceAge_gt?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceAge_gte?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceAge_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  minPriceAge_lt?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceAge_lte?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceAge_not?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceAge_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalAccount?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_gt?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_gte?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalAccount_lt?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_lte?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_not?: InputMaybe<Scalars['Int']['input']>;
  totalAccount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalFee?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalFee_lt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_lte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalPair?: InputMaybe<Scalars['Int']['input']>;
  totalPair_gt?: InputMaybe<Scalars['Int']['input']>;
  totalPair_gte?: InputMaybe<Scalars['Int']['input']>;
  totalPair_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalPair_lt?: InputMaybe<Scalars['Int']['input']>;
  totalPair_lte?: InputMaybe<Scalars['Int']['input']>;
  totalPair_not?: InputMaybe<Scalars['Int']['input']>;
  totalPair_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalVolume?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume_lt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl?: InputMaybe<Scalars['Float']['input']>;
  tvl_gt?: InputMaybe<Scalars['Float']['input']>;
  tvl_gte?: InputMaybe<Scalars['Float']['input']>;
  tvl_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl_lt?: InputMaybe<Scalars['Float']['input']>;
  tvl_lte?: InputMaybe<Scalars['Float']['input']>;
  tvl_not?: InputMaybe<Scalars['Float']['input']>;
  tvl_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type FactoryPage = {
  __typename?: 'factoryPage';
  items: Array<Factory>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Pair = {
  __typename?: 'pair';
  address: Scalars['String']['output'];
  apr: Scalars['Float']['output'];
  bnhPrice: Scalars['Float']['output'];
  bnhReserve0: Scalars['Float']['output'];
  bnhReserve1: Scalars['Float']['output'];
  bnhTotalSupply: Scalars['Float']['output'];
  chainId: Scalars['Int']['output'];
  fee: Scalars['Float']['output'];
  feeDay: Scalars['Float']['output'];
  k: Scalars['Float']['output'];
  lambda: Scalars['Float']['output'];
  lpPrice: Scalars['Float']['output'];
  netPnL: Scalars['Float']['output'];
  protocolFee: Scalars['Float']['output'];
  reserve0: Scalars['Float']['output'];
  reserve0USD: Scalars['Float']['output'];
  reserve1: Scalars['Float']['output'];
  reserve1USD: Scalars['Float']['output'];
  token0?: Maybe<Token>;
  token0Address: Scalars['String']['output'];
  token1?: Maybe<Token>;
  token1Address: Scalars['String']['output'];
  totalSupply: Scalars['Float']['output'];
  totalTxn: Scalars['BigInt']['output'];
  tvl: Scalars['Float']['output'];
};

export type PairDayData = {
  __typename?: 'pairDayData';
  address: Scalars['String']['output'];
  apr: Scalars['Float']['output'];
  bnhPrice: Scalars['Float']['output'];
  chainId: Scalars['Int']['output'];
  lpPrice: Scalars['Float']['output'];
  netPnL: Scalars['Float']['output'];
  startUnix: Scalars['Int']['output'];
  totalFee: Scalars['Float']['output'];
  totalVolume: Scalars['Float']['output'];
  tvl: Scalars['Float']['output'];
};

export type PairDayDataFilter = {
  AND?: InputMaybe<Array<InputMaybe<PairDayDataFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PairDayDataFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  apr?: InputMaybe<Scalars['Float']['input']>;
  apr_gt?: InputMaybe<Scalars['Float']['input']>;
  apr_gte?: InputMaybe<Scalars['Float']['input']>;
  apr_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  apr_lt?: InputMaybe<Scalars['Float']['input']>;
  apr_lte?: InputMaybe<Scalars['Float']['input']>;
  apr_not?: InputMaybe<Scalars['Float']['input']>;
  apr_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lpPrice?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL_lt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_lte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startUnix?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startUnix_lt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_lte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalFee?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalFee_lt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_lte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume_lt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl?: InputMaybe<Scalars['Float']['input']>;
  tvl_gt?: InputMaybe<Scalars['Float']['input']>;
  tvl_gte?: InputMaybe<Scalars['Float']['input']>;
  tvl_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl_lt?: InputMaybe<Scalars['Float']['input']>;
  tvl_lte?: InputMaybe<Scalars['Float']['input']>;
  tvl_not?: InputMaybe<Scalars['Float']['input']>;
  tvl_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type PairDayDataPage = {
  __typename?: 'pairDayDataPage';
  items: Array<PairDayData>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PairFilter = {
  AND?: InputMaybe<Array<InputMaybe<PairFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PairFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  apr?: InputMaybe<Scalars['Float']['input']>;
  apr_gt?: InputMaybe<Scalars['Float']['input']>;
  apr_gte?: InputMaybe<Scalars['Float']['input']>;
  apr_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  apr_lt?: InputMaybe<Scalars['Float']['input']>;
  apr_lte?: InputMaybe<Scalars['Float']['input']>;
  apr_not?: InputMaybe<Scalars['Float']['input']>;
  apr_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhReserve0?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve0_gt?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve0_gte?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve0_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhReserve0_lt?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve0_lte?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve0_not?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhReserve1?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve1_gt?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve1_gte?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve1_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhReserve1_lt?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve1_lte?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve1_not?: InputMaybe<Scalars['Float']['input']>;
  bnhReserve1_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhTotalSupply?: InputMaybe<Scalars['Float']['input']>;
  bnhTotalSupply_gt?: InputMaybe<Scalars['Float']['input']>;
  bnhTotalSupply_gte?: InputMaybe<Scalars['Float']['input']>;
  bnhTotalSupply_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhTotalSupply_lt?: InputMaybe<Scalars['Float']['input']>;
  bnhTotalSupply_lte?: InputMaybe<Scalars['Float']['input']>;
  bnhTotalSupply_not?: InputMaybe<Scalars['Float']['input']>;
  bnhTotalSupply_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  fee?: InputMaybe<Scalars['Float']['input']>;
  feeDay?: InputMaybe<Scalars['Float']['input']>;
  feeDay_gt?: InputMaybe<Scalars['Float']['input']>;
  feeDay_gte?: InputMaybe<Scalars['Float']['input']>;
  feeDay_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  feeDay_lt?: InputMaybe<Scalars['Float']['input']>;
  feeDay_lte?: InputMaybe<Scalars['Float']['input']>;
  feeDay_not?: InputMaybe<Scalars['Float']['input']>;
  feeDay_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  fee_gt?: InputMaybe<Scalars['Float']['input']>;
  fee_gte?: InputMaybe<Scalars['Float']['input']>;
  fee_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  fee_lt?: InputMaybe<Scalars['Float']['input']>;
  fee_lte?: InputMaybe<Scalars['Float']['input']>;
  fee_not?: InputMaybe<Scalars['Float']['input']>;
  fee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  k?: InputMaybe<Scalars['Float']['input']>;
  k_gt?: InputMaybe<Scalars['Float']['input']>;
  k_gte?: InputMaybe<Scalars['Float']['input']>;
  k_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  k_lt?: InputMaybe<Scalars['Float']['input']>;
  k_lte?: InputMaybe<Scalars['Float']['input']>;
  k_not?: InputMaybe<Scalars['Float']['input']>;
  k_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lambda?: InputMaybe<Scalars['Float']['input']>;
  lambda_gt?: InputMaybe<Scalars['Float']['input']>;
  lambda_gte?: InputMaybe<Scalars['Float']['input']>;
  lambda_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lambda_lt?: InputMaybe<Scalars['Float']['input']>;
  lambda_lte?: InputMaybe<Scalars['Float']['input']>;
  lambda_not?: InputMaybe<Scalars['Float']['input']>;
  lambda_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpPrice?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL_lt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_lte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  protocolFee?: InputMaybe<Scalars['Float']['input']>;
  protocolFee_gt?: InputMaybe<Scalars['Float']['input']>;
  protocolFee_gte?: InputMaybe<Scalars['Float']['input']>;
  protocolFee_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  protocolFee_lt?: InputMaybe<Scalars['Float']['input']>;
  protocolFee_lte?: InputMaybe<Scalars['Float']['input']>;
  protocolFee_not?: InputMaybe<Scalars['Float']['input']>;
  protocolFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0USD_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_not?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve0_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve0_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve0_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve0_not?: InputMaybe<Scalars['Float']['input']>;
  reserve0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1USD_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_not?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve1_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve1_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve1_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve1_not?: InputMaybe<Scalars['Float']['input']>;
  reserve1_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  token0Address?: InputMaybe<Scalars['String']['input']>;
  token0Address_contains?: InputMaybe<Scalars['String']['input']>;
  token0Address_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0Address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token0Address_not?: InputMaybe<Scalars['String']['input']>;
  token0Address_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0Address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0Address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token0Address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0Address_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1Address?: InputMaybe<Scalars['String']['input']>;
  token1Address_contains?: InputMaybe<Scalars['String']['input']>;
  token1Address_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1Address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token1Address_not?: InputMaybe<Scalars['String']['input']>;
  token1Address_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1Address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1Address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token1Address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1Address_starts_with?: InputMaybe<Scalars['String']['input']>;
  totalSupply?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalSupply_lt?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_not?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalTxn?: InputMaybe<Scalars['BigInt']['input']>;
  totalTxn_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTxn_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTxn_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  totalTxn_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalTxn_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalTxn_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalTxn_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  tvl?: InputMaybe<Scalars['Float']['input']>;
  tvl_gt?: InputMaybe<Scalars['Float']['input']>;
  tvl_gte?: InputMaybe<Scalars['Float']['input']>;
  tvl_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl_lt?: InputMaybe<Scalars['Float']['input']>;
  tvl_lte?: InputMaybe<Scalars['Float']['input']>;
  tvl_not?: InputMaybe<Scalars['Float']['input']>;
  tvl_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type PairHourData = {
  __typename?: 'pairHourData';
  address: Scalars['String']['output'];
  apr: Scalars['Float']['output'];
  bnhPrice: Scalars['Float']['output'];
  chainId: Scalars['Int']['output'];
  lpPrice: Scalars['Float']['output'];
  netPnL: Scalars['Float']['output'];
  startUnix: Scalars['Int']['output'];
  totalFee: Scalars['Float']['output'];
  totalVolume: Scalars['Float']['output'];
  tvl: Scalars['Float']['output'];
};

export type PairHourDataFilter = {
  AND?: InputMaybe<Array<InputMaybe<PairHourDataFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PairHourDataFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  apr?: InputMaybe<Scalars['Float']['input']>;
  apr_gt?: InputMaybe<Scalars['Float']['input']>;
  apr_gte?: InputMaybe<Scalars['Float']['input']>;
  apr_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  apr_lt?: InputMaybe<Scalars['Float']['input']>;
  apr_lte?: InputMaybe<Scalars['Float']['input']>;
  apr_not?: InputMaybe<Scalars['Float']['input']>;
  apr_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lpPrice?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL_lt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_lte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startUnix?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startUnix_lt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_lte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalFee?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalFee_lt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_lte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume_lt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl?: InputMaybe<Scalars['Float']['input']>;
  tvl_gt?: InputMaybe<Scalars['Float']['input']>;
  tvl_gte?: InputMaybe<Scalars['Float']['input']>;
  tvl_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl_lt?: InputMaybe<Scalars['Float']['input']>;
  tvl_lte?: InputMaybe<Scalars['Float']['input']>;
  tvl_not?: InputMaybe<Scalars['Float']['input']>;
  tvl_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type PairHourDataPage = {
  __typename?: 'pairHourDataPage';
  items: Array<PairHourData>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PairMinuteData = {
  __typename?: 'pairMinuteData';
  address: Scalars['String']['output'];
  apr: Scalars['Float']['output'];
  bnhPrice: Scalars['Float']['output'];
  chainId: Scalars['Int']['output'];
  lpPrice: Scalars['Float']['output'];
  netPnL: Scalars['Float']['output'];
  startUnix: Scalars['Int']['output'];
  totalFee: Scalars['Float']['output'];
  totalVolume: Scalars['Float']['output'];
  tvl: Scalars['Float']['output'];
};

export type PairMinuteDataFilter = {
  AND?: InputMaybe<Array<InputMaybe<PairMinuteDataFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PairMinuteDataFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  apr?: InputMaybe<Scalars['Float']['input']>;
  apr_gt?: InputMaybe<Scalars['Float']['input']>;
  apr_gte?: InputMaybe<Scalars['Float']['input']>;
  apr_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  apr_lt?: InputMaybe<Scalars['Float']['input']>;
  apr_lte?: InputMaybe<Scalars['Float']['input']>;
  apr_not?: InputMaybe<Scalars['Float']['input']>;
  apr_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  bnhPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not?: InputMaybe<Scalars['Float']['input']>;
  bnhPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lpPrice?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_gte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpPrice_lt?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_lte?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not?: InputMaybe<Scalars['Float']['input']>;
  lpPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_gte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  netPnL_lt?: InputMaybe<Scalars['Float']['input']>;
  netPnL_lte?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not?: InputMaybe<Scalars['Float']['input']>;
  netPnL_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startUnix?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_gte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startUnix_lt?: InputMaybe<Scalars['Int']['input']>;
  startUnix_lte?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not?: InputMaybe<Scalars['Int']['input']>;
  startUnix_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalFee?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_gte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalFee_lt?: InputMaybe<Scalars['Float']['input']>;
  totalFee_lte?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not?: InputMaybe<Scalars['Float']['input']>;
  totalFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_gte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalVolume_lt?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_lte?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not?: InputMaybe<Scalars['Float']['input']>;
  totalVolume_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl?: InputMaybe<Scalars['Float']['input']>;
  tvl_gt?: InputMaybe<Scalars['Float']['input']>;
  tvl_gte?: InputMaybe<Scalars['Float']['input']>;
  tvl_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  tvl_lt?: InputMaybe<Scalars['Float']['input']>;
  tvl_lte?: InputMaybe<Scalars['Float']['input']>;
  tvl_not?: InputMaybe<Scalars['Float']['input']>;
  tvl_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type PairMinuteDataPage = {
  __typename?: 'pairMinuteDataPage';
  items: Array<PairMinuteData>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PairPage = {
  __typename?: 'pairPage';
  items: Array<Pair>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Token = {
  __typename?: 'token';
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  decimals: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  priceFeedId?: Maybe<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  totalSupply: Scalars['Float']['output'];
};

export type TokenFilter = {
  AND?: InputMaybe<Array<InputMaybe<TokenFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<TokenFilter>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  address_starts_with?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  priceFeedId?: InputMaybe<Scalars['String']['input']>;
  priceFeedId_contains?: InputMaybe<Scalars['String']['input']>;
  priceFeedId_ends_with?: InputMaybe<Scalars['String']['input']>;
  priceFeedId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priceFeedId_not?: InputMaybe<Scalars['String']['input']>;
  priceFeedId_not_contains?: InputMaybe<Scalars['String']['input']>;
  priceFeedId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  priceFeedId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priceFeedId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  priceFeedId_starts_with?: InputMaybe<Scalars['String']['input']>;
  price_gt?: InputMaybe<Scalars['Float']['input']>;
  price_gte?: InputMaybe<Scalars['Float']['input']>;
  price_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  price_lt?: InputMaybe<Scalars['Float']['input']>;
  price_lte?: InputMaybe<Scalars['Float']['input']>;
  price_not?: InputMaybe<Scalars['Float']['input']>;
  price_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  totalSupply?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  totalSupply_lt?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_not?: InputMaybe<Scalars['Float']['input']>;
  totalSupply_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type TokenPage = {
  __typename?: 'tokenPage';
  items: Array<Token>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Transaction = {
  __typename?: 'transaction';
  amount0In: Scalars['Float']['output'];
  amount0Out: Scalars['Float']['output'];
  amount1In: Scalars['Float']['output'];
  amount1Out: Scalars['Float']['output'];
  chainId: Scalars['Int']['output'];
  from: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  lpBurn: Scalars['Float']['output'];
  lpMint: Scalars['Float']['output'];
  lpSupply: Scalars['Float']['output'];
  pair: Scalars['String']['output'];
  price0: Scalars['Float']['output'];
  price1: Scalars['Float']['output'];
  reserve0: Scalars['Float']['output'];
  reserve0USD: Scalars['Float']['output'];
  reserve1: Scalars['Float']['output'];
  reserve1USD: Scalars['Float']['output'];
  skewnessPrice0: Scalars['Float']['output'];
  skewnessPrice1: Scalars['Float']['output'];
  timestamp: Scalars['BigInt']['output'];
  to: Scalars['String']['output'];
};

export type TransactionFilter = {
  AND?: InputMaybe<Array<InputMaybe<TransactionFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<TransactionFilter>>>;
  amount0In?: InputMaybe<Scalars['Float']['input']>;
  amount0In_gt?: InputMaybe<Scalars['Float']['input']>;
  amount0In_gte?: InputMaybe<Scalars['Float']['input']>;
  amount0In_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  amount0In_lt?: InputMaybe<Scalars['Float']['input']>;
  amount0In_lte?: InputMaybe<Scalars['Float']['input']>;
  amount0In_not?: InputMaybe<Scalars['Float']['input']>;
  amount0In_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  amount0Out?: InputMaybe<Scalars['Float']['input']>;
  amount0Out_gt?: InputMaybe<Scalars['Float']['input']>;
  amount0Out_gte?: InputMaybe<Scalars['Float']['input']>;
  amount0Out_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  amount0Out_lt?: InputMaybe<Scalars['Float']['input']>;
  amount0Out_lte?: InputMaybe<Scalars['Float']['input']>;
  amount0Out_not?: InputMaybe<Scalars['Float']['input']>;
  amount0Out_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  amount1In?: InputMaybe<Scalars['Float']['input']>;
  amount1In_gt?: InputMaybe<Scalars['Float']['input']>;
  amount1In_gte?: InputMaybe<Scalars['Float']['input']>;
  amount1In_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  amount1In_lt?: InputMaybe<Scalars['Float']['input']>;
  amount1In_lte?: InputMaybe<Scalars['Float']['input']>;
  amount1In_not?: InputMaybe<Scalars['Float']['input']>;
  amount1In_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  amount1Out?: InputMaybe<Scalars['Float']['input']>;
  amount1Out_gt?: InputMaybe<Scalars['Float']['input']>;
  amount1Out_gte?: InputMaybe<Scalars['Float']['input']>;
  amount1Out_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  amount1Out_lt?: InputMaybe<Scalars['Float']['input']>;
  amount1Out_lte?: InputMaybe<Scalars['Float']['input']>;
  amount1Out_not?: InputMaybe<Scalars['Float']['input']>;
  amount1Out_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  chainId_gt?: InputMaybe<Scalars['Int']['input']>;
  chainId_gte?: InputMaybe<Scalars['Int']['input']>;
  chainId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  chainId_lt?: InputMaybe<Scalars['Int']['input']>;
  chainId_lte?: InputMaybe<Scalars['Int']['input']>;
  chainId_not?: InputMaybe<Scalars['Int']['input']>;
  chainId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  from?: InputMaybe<Scalars['String']['input']>;
  from_contains?: InputMaybe<Scalars['String']['input']>;
  from_ends_with?: InputMaybe<Scalars['String']['input']>;
  from_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  from_not?: InputMaybe<Scalars['String']['input']>;
  from_not_contains?: InputMaybe<Scalars['String']['input']>;
  from_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  from_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  from_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  from_starts_with?: InputMaybe<Scalars['String']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  hash_contains?: InputMaybe<Scalars['String']['input']>;
  hash_ends_with?: InputMaybe<Scalars['String']['input']>;
  hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hash_not?: InputMaybe<Scalars['String']['input']>;
  hash_not_contains?: InputMaybe<Scalars['String']['input']>;
  hash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  hash_starts_with?: InputMaybe<Scalars['String']['input']>;
  lpBurn?: InputMaybe<Scalars['Float']['input']>;
  lpBurn_gt?: InputMaybe<Scalars['Float']['input']>;
  lpBurn_gte?: InputMaybe<Scalars['Float']['input']>;
  lpBurn_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpBurn_lt?: InputMaybe<Scalars['Float']['input']>;
  lpBurn_lte?: InputMaybe<Scalars['Float']['input']>;
  lpBurn_not?: InputMaybe<Scalars['Float']['input']>;
  lpBurn_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpMint?: InputMaybe<Scalars['Float']['input']>;
  lpMint_gt?: InputMaybe<Scalars['Float']['input']>;
  lpMint_gte?: InputMaybe<Scalars['Float']['input']>;
  lpMint_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpMint_lt?: InputMaybe<Scalars['Float']['input']>;
  lpMint_lte?: InputMaybe<Scalars['Float']['input']>;
  lpMint_not?: InputMaybe<Scalars['Float']['input']>;
  lpMint_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpSupply?: InputMaybe<Scalars['Float']['input']>;
  lpSupply_gt?: InputMaybe<Scalars['Float']['input']>;
  lpSupply_gte?: InputMaybe<Scalars['Float']['input']>;
  lpSupply_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lpSupply_lt?: InputMaybe<Scalars['Float']['input']>;
  lpSupply_lte?: InputMaybe<Scalars['Float']['input']>;
  lpSupply_not?: InputMaybe<Scalars['Float']['input']>;
  lpSupply_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  pair?: InputMaybe<Scalars['String']['input']>;
  pair_contains?: InputMaybe<Scalars['String']['input']>;
  pair_ends_with?: InputMaybe<Scalars['String']['input']>;
  pair_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pair_not?: InputMaybe<Scalars['String']['input']>;
  pair_not_contains?: InputMaybe<Scalars['String']['input']>;
  pair_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pair_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pair_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pair_starts_with?: InputMaybe<Scalars['String']['input']>;
  price0?: InputMaybe<Scalars['Float']['input']>;
  price0_gt?: InputMaybe<Scalars['Float']['input']>;
  price0_gte?: InputMaybe<Scalars['Float']['input']>;
  price0_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  price0_lt?: InputMaybe<Scalars['Float']['input']>;
  price0_lte?: InputMaybe<Scalars['Float']['input']>;
  price0_not?: InputMaybe<Scalars['Float']['input']>;
  price0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  price1?: InputMaybe<Scalars['Float']['input']>;
  price1_gt?: InputMaybe<Scalars['Float']['input']>;
  price1_gte?: InputMaybe<Scalars['Float']['input']>;
  price1_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  price1_lt?: InputMaybe<Scalars['Float']['input']>;
  price1_lte?: InputMaybe<Scalars['Float']['input']>;
  price1_not?: InputMaybe<Scalars['Float']['input']>;
  price1_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0USD_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_not?: InputMaybe<Scalars['Float']['input']>;
  reserve0USD_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve0_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve0_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve0_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve0_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve0_not?: InputMaybe<Scalars['Float']['input']>;
  reserve0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1USD_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_not?: InputMaybe<Scalars['Float']['input']>;
  reserve1USD_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1_gt?: InputMaybe<Scalars['Float']['input']>;
  reserve1_gte?: InputMaybe<Scalars['Float']['input']>;
  reserve1_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  reserve1_lt?: InputMaybe<Scalars['Float']['input']>;
  reserve1_lte?: InputMaybe<Scalars['Float']['input']>;
  reserve1_not?: InputMaybe<Scalars['Float']['input']>;
  reserve1_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  skewnessPrice0?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice0_gt?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice0_gte?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice0_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  skewnessPrice0_lt?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice0_lte?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice0_not?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice0_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  skewnessPrice1?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice1_gt?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice1_gte?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice1_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  skewnessPrice1_lt?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice1_lte?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice1_not?: InputMaybe<Scalars['Float']['input']>;
  skewnessPrice1_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  to?: InputMaybe<Scalars['String']['input']>;
  to_contains?: InputMaybe<Scalars['String']['input']>;
  to_ends_with?: InputMaybe<Scalars['String']['input']>;
  to_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  to_not?: InputMaybe<Scalars['String']['input']>;
  to_not_contains?: InputMaybe<Scalars['String']['input']>;
  to_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  to_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  to_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  to_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type TransactionPage = {
  __typename?: 'transactionPage';
  items: Array<Transaction>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MyQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyQueryQuery = { __typename?: 'Query', pairs: { __typename?: 'pairPage', items: Array<{ __typename?: 'pair', address: string, apr: number, bnhPrice: number, bnhReserve0: number, bnhReserve1: number, bnhTotalSupply: number, chainId: number, fee: number, feeDay: number, k: number, lambda: number, lpPrice: number, netPnL: number, protocolFee: number, reserve0: number, reserve0USD: number, reserve1: number, reserve1USD: number, totalSupply: number, totalTxn: any, tvl: number, token0?: { __typename?: 'token', address: string, chainId: number, decimals: number, name: string, price: number, priceFeedId?: string | null, symbol: string, totalSupply: number } | null, token1?: { __typename?: 'token', address: string, chainId: number, decimals: number, name: string, price: number, priceFeedId?: string | null, symbol: string, totalSupply: number } | null }> } };


export const MyQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pairs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"chainId"},"value":{"kind":"IntValue","value":"80094"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"apr"}},{"kind":"Field","name":{"kind":"Name","value":"bnhPrice"}},{"kind":"Field","name":{"kind":"Name","value":"bnhReserve0"}},{"kind":"Field","name":{"kind":"Name","value":"bnhReserve1"}},{"kind":"Field","name":{"kind":"Name","value":"bnhTotalSupply"}},{"kind":"Field","name":{"kind":"Name","value":"chainId"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeDay"}},{"kind":"Field","name":{"kind":"Name","value":"k"}},{"kind":"Field","name":{"kind":"Name","value":"lambda"}},{"kind":"Field","name":{"kind":"Name","value":"lpPrice"}},{"kind":"Field","name":{"kind":"Name","value":"netPnL"}},{"kind":"Field","name":{"kind":"Name","value":"protocolFee"}},{"kind":"Field","name":{"kind":"Name","value":"reserve0"}},{"kind":"Field","name":{"kind":"Name","value":"reserve0USD"}},{"kind":"Field","name":{"kind":"Name","value":"reserve1"}},{"kind":"Field","name":{"kind":"Name","value":"reserve1USD"}},{"kind":"Field","name":{"kind":"Name","value":"token0"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"chainId"}},{"kind":"Field","name":{"kind":"Name","value":"decimals"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"priceFeedId"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupply"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token1"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"chainId"}},{"kind":"Field","name":{"kind":"Name","value":"decimals"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"priceFeedId"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupply"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalSupply"}},{"kind":"Field","name":{"kind":"Name","value":"totalTxn"}},{"kind":"Field","name":{"kind":"Name","value":"tvl"}}]}}]}}]}}]} as unknown as DocumentNode<MyQueryQuery, MyQueryQueryVariables>;