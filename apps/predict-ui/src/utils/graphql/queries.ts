import { gql, request } from 'graphql-request';
import { OLAS_AGENTS_SUBGRAPH_URL, OMEN_SUBGRAPH_URL } from '../../constants/urls';
import { FpmmTrades, TraderAgent } from '../../types';

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

export const getTraderAgent = async (params: { id: string }) =>
  request<{ traderAgent: TraderAgent | null }>(
    OLAS_AGENTS_SUBGRAPH_URL,
    getTraderAgentQuery,
    params,
  );

export const getAgentLastTradeTimestamp = async (params: { creator: string }) =>
  request<FpmmTrades>(OMEN_SUBGRAPH_URL, getAgentLastTradeTimestampQuery, params);
