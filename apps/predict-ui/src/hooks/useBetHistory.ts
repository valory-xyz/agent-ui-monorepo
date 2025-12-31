import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockBetHistory, mockPositionDetails } from '../mocks/mockBetHistory';
import { AgentPredictionHistoryResponse, PositionDetails } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useBetHistory = ({ page, pageSize }: { page: number; pageSize: number }) => {
  const query = useQuery<AgentPredictionHistoryResponse>({
    queryKey: [REACT_QUERY_KEYS.PREDICTION_HISTORY, page, pageSize],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockBetHistory);

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

export const useBetDetails = ({ id }: { id: string }) => {
  const query = useQuery<PositionDetails>({
    queryKey: [REACT_QUERY_KEYS.PREDICTION_DETAILS, id],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockPositionDetails);

      const response = await fetch(`${API_V1}/agent/position-details?id=${id}`);
      if (!response.ok) throw new Error(`Failed to fetch position details for id ${id}`);

      return response.json();
    },
    refetchInterval: FIVE_MINUTES,
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return query;
};
