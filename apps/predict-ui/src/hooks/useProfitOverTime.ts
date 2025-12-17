import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockProfitOverTime } from '../mocks/mockProfitOverTime';
import { AgentProfitTimeseriesResponse, AgentWindow } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useProfitOverTime = ({ window }: { window: AgentWindow }) => {
  const query = useQuery<AgentProfitTimeseriesResponse>({
    queryKey: [REACT_QUERY_KEYS.PROFIT_OVER_TIME, window],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockProfitOverTime);

      const response = await fetch(`${API_V1}/agent/profit-over-time?window=${window}`);
      if (!response.ok) throw new Error('Failed to fetch profit over time');

      return response.json();
    },
    refetchInterval: FIVE_MINUTES,
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return query;
};
