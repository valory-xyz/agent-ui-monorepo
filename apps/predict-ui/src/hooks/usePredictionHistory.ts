import { API_V1 } from '@agent-ui-monorepo/util-constants-and-types';
import { FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockPredictionHistory } from '../mocks/mockPredictionHistory.ts';
import { AgentPredictionHistoryResponse } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const usePredictionHistory = ({ page, pageSize }: { page: number; pageSize: number }) => {
  const query = useQuery<AgentPredictionHistoryResponse>({
    queryKey: [REACT_QUERY_KEYS.PREDICTION_HISTORY, page, pageSize],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockPredictionHistory);

      const response = await fetch(
        `${API_V1}/agent/prediction-history?page=${page}&page_size=${pageSize}`,
      );
      if (!response.ok) throw new Error('Failed to fetch prediction history');

      return response.json();
    },
    refetchInterval: FIVE_MINUTES,
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return query;
};
