import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { mockPortfolio } from '../mocks/mockPortfolio';
import { PortfolioResponse } from '../types';

export const usePortfolio = () => {
  const query = useQuery<PortfolioResponse>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const mock = devMock(() => delay(mockPortfolio, 2000));
      if (mock !== null) return mock;

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
