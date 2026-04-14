import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { getMockProfitOverTime } from '../mocks/mockProfitOverTime';
import { AgentProfitTimeseriesResponse, AgentWindow } from '../types';

export const useProfitOverTime = ({ window }: { window: AgentWindow }) => {
  const query = useQuery<AgentProfitTimeseriesResponse>({
    queryKey: [REACT_QUERY_KEYS.PROFIT_OVER_TIME, window],
    queryFn: async () => {
      const mock = devMock(() => delay(getMockProfitOverTime(window)));
      if (mock !== null) return mock;

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
