import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockPositionDetails, mockTradeHistory } from '../mocks/mockTradeHistory';
import { AgentPredictionHistoryResponse, PositionDetails } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useTradeHistory = ({ page, pageSize }: { page: number; pageSize: number }) => {
  const query = useQuery<AgentPredictionHistoryResponse>({
    queryKey: [REACT_QUERY_KEYS.PREDICTION_HISTORY, page, pageSize],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockTradeHistory);

      const [response] = await Promise.all([
        fetch(`${API_V1}/agent/prediction-history?page=${page}&page_size=${pageSize}`),
        delay(undefined, 1),
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

export const usePositionDetails = ({ id }: { id: string }) => {
  const query = useQuery<PositionDetails>({
    queryKey: [REACT_QUERY_KEYS.PREDICTION_DETAILS, id],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockPositionDetails);

      const response = await fetch(`${API_V1}/agent/position-details/${id}`);
      if (!response.ok) throw new Error('Failed to fetch position details');
      return response.json();
    },
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return query;
};
