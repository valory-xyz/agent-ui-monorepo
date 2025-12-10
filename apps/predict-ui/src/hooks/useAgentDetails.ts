import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockAgentDetails } from '../mocks/mockAgentDetails';
import { mockPerformance } from '../mocks/mockPerformance';
import { AgentDetailsResponse, AgentMetricsResponse } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useAgentDetails = () => {
  const {
    data: agentDetails,
    isLoading: isAgentDetailsLoading,
    isError: isAgentDetailsError,
  } = useQuery<AgentDetailsResponse>({
    queryKey: [REACT_QUERY_KEYS.AGENT_DETAILS],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockAgentDetails);

      const response = await fetch(`${API_V1}/agent/details`);
      if (!response.ok) throw new Error('Failed to fetch agent details');

      return response.json();
    },
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  const {
    data: performance,
    isLoading: isPerformanceLoading,
    isError: isPerformanceError,
  } = useQuery<AgentMetricsResponse>({
    queryKey: [REACT_QUERY_KEYS.PERFORMANCE],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockPerformance);

      const response = await fetch(`${API_V1}/agent/performance`);
      if (!response.ok) throw new Error('Failed to fetch agent performance');

      return response.json();
    },
    refetchInterval: FIVE_MINUTES,
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return {
    data: { agentDetails, performance },
    isLoading: isAgentDetailsLoading || isPerformanceLoading,
    isError: isAgentDetailsError || isPerformanceError,
  };
};
