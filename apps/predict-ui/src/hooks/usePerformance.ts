import { API_V1, ONE_MINUTE } from '@agent-ui-monorepo/util-constants-and-types';
import { exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { mockPerformance } from '../mocks/mockPerformance';
import { AgentMetricsResponse } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const usePerformance = () => {
  const query = useQuery<AgentMetricsResponse>({
    queryKey: ['agentPerformance'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockPerformance);
          }, 2000);
        });
      }

      const response = await fetch(`${API_V1}/agent/performance`);
      if (!response.ok) throw new Error('Failed to fetch agent performance');

      return response.json();
    },
    refetchInterval: ONE_MINUTE, // ASK THE TEAM: Is this interval appropriate?
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return query;
};
