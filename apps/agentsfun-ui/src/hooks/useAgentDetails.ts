import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { useQuery } from '@tanstack/react-query';

import { mockAgentInfo } from '../mocks/mock';
import { AgentInfoResponse } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useAgentDetails = () =>
  useQuery<AgentInfoResponse | null>({
    queryKey: ['agentInfo'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(mockAgentInfo), 2000));
      }

      const response = await fetch(`${LOCAL}/agent-info`);
      if (!response.ok) throw new Error('Failed to fetch agent info');

      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchInterval: (data) => {
      // Keep polling every 2 seconds if no data is available
      if (data === null) return 2000;

      // Slow down when data is available
      return FORTYFIVE_SECONDS;
    },
  });
