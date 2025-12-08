import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockAgentDetails } from '../mocks/mockAgentDetails';
import { mockAgentInfo, mockTraderInfo } from '../mocks/mockAgentInfo';
import { AgentDetailsResponse, AgentInfoResponse, TraderAgent } from '../types';
import { getTraderAgent } from '../utils/graphql/queries';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useAgentDetails = () => {
  const {
    data: agentDetails,
    isLoading: isAgentDetailsLoading,
    isError: isAgentDetailsError,
  } = useQuery<AgentDetailsResponse>({
    queryKey: [REACT_QUERY_KEYS.AGENT_DETAILS],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockAgentDetails);
          }, 2000);
        });
      }
      const response = await fetch(`${LOCAL}/agent/details`);
      if (!response.ok) throw new Error('Failed to fetch agent details');

      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  // NOTE: TO BE REMOVED
  const {
    data: agentInfo,
    isLoading: isAgentInfoLoading,
    isError: isAgentInfoError,
  } = useQuery<AgentInfoResponse>({
    queryKey: [REACT_QUERY_KEYS.AGENT_INFO],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockAgentInfo);
          }, 2000);
        });
      }
      const response = await fetch(`${LOCAL}/agent-info`);
      if (!response.ok) throw new Error('Failed to fetch agent info');

      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  // NOTE: TO BE REMOVED
  const {
    data: traderInfo,
    isLoading: isTraderInfoLoading,
    isFetched: isTraderInfoFetched,
    isError: isTraderInfoError,
  } = useQuery({
    enabled: !!agentInfo?.safe_address,
    queryKey: ['traderInfo', agentInfo?.safe_address],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise<{ traderAgent: TraderAgent }>((resolve) => {
          setTimeout(() => {
            resolve({ traderAgent: mockTraderInfo });
          }, 2000);
        });
      }

      return getTraderAgent({ id: `${agentInfo?.safe_address}`.toLowerCase() });
    },
    select: (data) => data.traderAgent,
  });

  return {
    data: {
      agentInfo,
      traderInfo,
      agentDetails,
    },
    isLoading: isAgentInfoLoading || isTraderInfoLoading || isAgentDetailsLoading,
    isFetched: isTraderInfoFetched,
    isError: isAgentInfoError || isTraderInfoError || isAgentDetailsError,
  };
};
