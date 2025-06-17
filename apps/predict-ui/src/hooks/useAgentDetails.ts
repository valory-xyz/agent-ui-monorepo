import { useQuery } from '@tanstack/react-query';

import { LOCAL } from '../constants/urls';
import { mockAgentInfo } from '../mocks/mockAgentInfo';
import { AgentInfoResponse } from '../types';
import { getTraderAgent } from '../utils/graphql/queries';

const IS_MOCK_ENABLED = import.meta.env.VITE_IS_MOCK_ENABLED === 'true';

export const useAgentDetails = () => {
  const {
    data: agentInfo,
    isLoading: isAgentInfoLoading,
    isError: isAgentInfoError,
  } = useQuery<AgentInfoResponse>({
    queryKey: ['agentInfo'],
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

  const {
    data: traderInfo,
    isLoading: isTraderInfoLoading,
    isFetched: isTraderInfoFetched,
    isError: isTraderInfoError,
  } = useQuery({
    enabled: !!agentInfo?.safe_address,
    queryKey: ['traderInfo', agentInfo?.safe_address],
    queryFn: async () => getTraderAgent({ id: `${agentInfo?.safe_address}`.toLowerCase() }),
    select: (data) => data.traderAgent,
  });

  return {
    data: {
      agentInfo,
      traderInfo,
    },
    isLoading: isAgentInfoLoading || isTraderInfoLoading,
    isFetched: isTraderInfoFetched,
    isError: isAgentInfoError || isTraderInfoError,
  };
};
