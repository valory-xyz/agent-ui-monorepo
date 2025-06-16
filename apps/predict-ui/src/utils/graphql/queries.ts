import { gql, request } from 'graphql-request';
import { OLAS_AGENTS_SUBGRAPH_URL, OMEN_SUBGRAPH_URL } from '../../constants/urls';
import { FpmmTrades, GetUserTradesParams, TraderAgent } from '../../types';

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
