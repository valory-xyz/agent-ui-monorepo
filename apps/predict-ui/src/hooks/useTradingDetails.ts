import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockTradingDetails } from '../mocks/mockTradingDetails';
import { TradingDetailsResponse } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useTradingDetails = () => {
  const query = useQuery<TradingDetailsResponse>({
    queryKey: [REACT_QUERY_KEYS.TRADING_DETAILS],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) return delay(mockTradingDetails);

      const response = await fetch(`${API_V1}/agent/trading-details`);
      if (!response.ok) throw new Error('Failed to fetch trading details');

      return response.json();
    },
    refetchInterval: FIVE_MINUTES,
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });

  return query;
};
