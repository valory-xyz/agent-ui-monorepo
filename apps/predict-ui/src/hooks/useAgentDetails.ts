import { API_V1, LOCAL, ONE_MINUTE } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockAgentDetails } from '../mocks/mockAgentDetails';
import { mockAgentInfo } from '../mocks/mockAgentInfo';
import { mockPerformance } from '../mocks/mockPerformance';
import { AgentDetailsResponse, AgentInfoResponse, AgentMetricsResponse } from '../types';

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

      const response = await fetch(`${LOCAL}/agent/details`);
      if (!response.ok) throw new Error('Failed to fetch agent details');

      return response.json();
    },
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  const {
    data: agentInfo,
    isLoading: isAgentInfoLoading,
    isError: isAgentInfoError,
  } = useQuery<AgentInfoResponse>({
    queryKey: [REACT_QUERY_KEYS.AGENT_INFO],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockAgentInfo);

      const response = await fetch(`${LOCAL}/agent-info`);
      if (!response.ok) throw new Error('Failed to fetch agent info');

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
    refetchInterval: ONE_MINUTE, // ASK THE TEAM: Is this interval appropriate?
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return {
    data: {
      agentInfo,
      agentDetails,
      performance,
    },
    isLoading: isAgentInfoLoading || isAgentDetailsLoading || isPerformanceLoading,
    isError: isAgentInfoError || isAgentDetailsError || isPerformanceError,
  };
};
