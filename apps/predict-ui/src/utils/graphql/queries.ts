import { gql, request } from 'graphql-request';
import {
  GNOSIS_STAKING_SUBGRAPH_URL,
  OLAS_AGENTS_SUBGRAPH_URL,
  OLAS_MECH_SUBGRAPH_URL,
  OMEN_SUBGRAPH_URL,
} from '../../constants/urls';
import {
  FpmmTrades,
  GetMechSenderParams,
  GetUserTradesParams,
  MechSender,
  Question,
  Service,
  TraderAgent,
  TraderAgentBets,
} from '../../types';

const getTraderAgentQuery = gql`
  query GetOlasTraderAgent($id: ID!) {
    traderAgent(id: $id) {
      id
      serviceId
      firstParticipation
      totalBets
      totalTraded
      totalPayout
      totalFees
      blockTimestamp
      bets(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
      }
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

const getTraderAgentBetsQuery = gql`
  query GetOlasTraderAgentBets($id: ID!) {
    traderAgent(id: $id) {
      id
      bets(first: 1000, orderBy: timestamp, orderDirection: desc) {
        outcomeIndex
        fixedProductMarketMaker {
          id
          currentAnswer
        }
      }
    }
  }
`;

const getMechSenderQuery = gql`
  query MechSender($id: ID!, $timestamp_gt: Int!) {
    sender(id: $id) {
      totalRequests
      requests(first: 1000, where: { blockTimestamp_gt: $timestamp_gt }) {
        id
        questionTitle
      }
    }
  }
`;

const getOpenMarketsQuery = gql`
  query Fpmms($timestamp_gt: Int!) {
    questions(where: { fixedProductMarketMaker_: { blockTimestamp_gt: $timestamp_gt } }) {
      id
      question
    }
  }
`;

const getStakingServiceQuery = gql`
  query StakingService($id: ID!) {
    service(id: $id) {
      id
      olasRewardsEarned
    }
  }
`;

export const getTraderAgent = async (params: { id: string }) =>
  request<{ traderAgent: TraderAgent | null }>(
    OLAS_AGENTS_SUBGRAPH_URL,
    getTraderAgentQuery,
    params,
  );

export const getUserTrades = async (params: GetUserTradesParams) =>
  request<FpmmTrades>(OMEN_SUBGRAPH_URL, getUserTradesQuery, params);

export const getTraderAgentBets = async (params: { id: string }) =>
  request<{ traderAgent: TraderAgentBets | null }>(
    OLAS_AGENTS_SUBGRAPH_URL,
    getTraderAgentBetsQuery,
    params,
  );

export const getMechSender = async (params: GetMechSenderParams) =>
  request<{ sender: MechSender | null }>(OLAS_MECH_SUBGRAPH_URL, getMechSenderQuery, params);

export const getOpenMarkets = async (params: { timestamp_gt: number }) =>
  request<{ questions: Question[] }>(OLAS_AGENTS_SUBGRAPH_URL, getOpenMarketsQuery, params);

export const getStakingService = async (params: { id: string }) =>
  request<{ service: Service | null }>(GNOSIS_STAKING_SUBGRAPH_URL, getStakingServiceQuery, params);
