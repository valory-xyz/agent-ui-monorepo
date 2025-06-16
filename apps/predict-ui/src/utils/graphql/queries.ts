import { gql, request } from 'graphql-request';
import {
  CONDITIONAL_TOKENS_SUBGRAPH_URL,
  OLAS_AGENTS_SUBGRAPH_URL,
  OMEN_SUBGRAPH_URL,
} from '../../constants/urls';
import {
  Conditions,
  FpmmTrades,
  GetMarketUserTradesParams,
  GetUserTradesParams,
  TraderAgent,
  UserPositions,
} from '../../types';

const getTraderAgentQuery = gql`
  query GetOlasTraderAgent($id: ID!) {
    traderAgent(id: $id) {
      id
      firstParticipation
      totalBets
    }
  }
`;

const getAgentLastTradeTimestampQuery = gql`
  query GetAgentLastTradeTimestamp($creator: ID!) {
    fpmmTrades(
      where: { creator: $creator }
      first: 1
      orderBy: creationTimestamp
      orderDirection: desc
    ) {
      id
      creationTimestamp
    }
  }
`;

const getUserTradesQuery = gql`
  query GetUserTrades(
    $creator: ID!
    $first: Int!
    $skip: Int
    $orderBy: String
    $orderDirection: String
  ) {
    fpmmTrades(
      where: { creator: $creator }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      creator {
        id
      }
      fpmm {
        id
        outcomes
      }
      title
      outcomeIndex
      id
      feeAmount
      collateralAmount
      collateralAmountUSD
      collateralToken
      outcomeTokenMarginalPrice
      outcomeTokensTraded
      oldOutcomeTokenMarginalPrice
      transactionHash
      creationTimestamp
      type
    }
  }
`;

const getConditionMarketQuery = gql`
  query OmenConditionsQuery($id: ID!) {
    conditions(where: { id: $id }) {
      fixedProductMarketMakers {
        id
        outcomes
        currentAnswer
        openingTimestamp
      }
    }
  }
`;

const getMarketUserTradesQuery = gql`
  query GetMarketUserTrades($creator: ID!, $fpmm: ID!, $outcomeIndex_in: [BigInt!]) {
    fpmmTrades(where: { fpmm: $fpmm, creator: $creator, outcomeIndex_in: $outcomeIndex_in }) {
      creator {
        id
      }
      title
      outcomeIndex
      id
      feeAmount
      collateralAmount
      collateralAmountUSD
      collateralToken
      outcomeTokenMarginalPrice
      outcomeTokensTraded
      oldOutcomeTokenMarginalPrice
      transactionHash
      creationTimestamp
      type
    }
  }
`;

const getUserPositionsQuery = gql`
  query OmenGetMyMarkets($id: ID!) {
    userPositions(
      where: { user_: { id: $id } }
      orderBy: position__createTimestamp
      orderDirection: desc
    ) {
      position {
        id
        conditionIdsStr
        indexSets
      }
    }
  }
`;

export const getTraderAgent = async (params: { id: string }) =>
  request<{ traderAgent: TraderAgent | null }>(
    OLAS_AGENTS_SUBGRAPH_URL,
    getTraderAgentQuery,
    params,
  );

export const getAgentLastTradeTimestamp = async (params: { creator: string }) =>
  request<FpmmTrades>(OMEN_SUBGRAPH_URL, getAgentLastTradeTimestampQuery, params);

export const getUserTrades = async (params: GetUserTradesParams) =>
  request<FpmmTrades>(OMEN_SUBGRAPH_URL, getUserTradesQuery, params);

export const getConditionMarket = async (params: { id: string }) =>
  request<Conditions>(OMEN_SUBGRAPH_URL, getConditionMarketQuery, params);

export const getMarketUserTrades = async (params: GetMarketUserTradesParams) =>
  request<FpmmTrades>(OMEN_SUBGRAPH_URL, getMarketUserTradesQuery, params);

export const getUserPositions = async (params: { id: string }) =>
  request<UserPositions>(CONDITIONAL_TOKENS_SUBGRAPH_URL, getUserPositionsQuery, params);
