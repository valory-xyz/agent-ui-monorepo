import { useQuery } from '@tanstack/react-query';

import { LOCAL } from '../constants/urls';
import { IS_MOCK_ENABLED } from '../mocks/config';
import { mockPortfolio } from '../mocks/mockPortfolio';
import { PortfolioResponse } from '../types';

export const usePortfolio = () => {
  const query = useQuery<PortfolioResponse>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockPortfolio);
          }, 2000);
        });
      }

      const response = await fetch(`${LOCAL}/portfolio`);
      if (!response.ok) throw new Error('Failed to fetch portfolio');

      return response.json();
    },
    refetchInterval: (query) => (query.state.data ? 5000 : 1000),
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  return query;
};
