import { useQuery } from '@tanstack/react-query';

import { LOCAL } from '../../constants/urls';
import { Funds } from '../../types';
import { mockFunds } from '../../mocks/mockFunds';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useFunds = () => {
  const query = useQuery<Funds>({
    queryKey: ['funds'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockFunds);
          }, 2000);
        });
      }

      const response = await fetch(`${LOCAL}/withdrawal/amount`);
      if (!response.ok) throw new Error('Failed to fetch withdrawal amount.');

      return response.json();
    },
    refetchInterval: (query) => (query.state.data ? 5000 : 1000),
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  return query;
};
