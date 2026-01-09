import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockBetHistory } from '../mocks/mockBetHistory';
import { AgentPredictionHistoryResponse } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useBetHistory = ({ page, pageSize }: { page: number; pageSize: number }) => {
  const query = useQuery<AgentPredictionHistoryResponse>({
    queryKey: [REACT_QUERY_KEYS.PREDICTION_HISTORY, page, pageSize],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockBetHistory);

      const [response] = await Promise.all([
        fetch(`${API_V1}/agent/prediction-history?page=${page}&page_size=${pageSize}`),
        // artificial delay to simulate network latency
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
      if (!response.ok) throw new Error('Failed to fetch prediction history');

      return response.json();
    },
    refetchInterval: FIVE_MINUTES,
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return query;
};
