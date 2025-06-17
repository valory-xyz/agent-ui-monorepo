import { useQuery } from '@tanstack/react-query';
import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockAgentInfo } from '../mocks/mockAgentInfo';
import { AgentInfoResponse } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

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
    refetchInterval: (query) => (query.state.data ? 5000 : 1000),
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  return {
    data: agentInfo,
    isLoading: isAgentInfoLoading,
    isError: isAgentInfoError,
  };
};
