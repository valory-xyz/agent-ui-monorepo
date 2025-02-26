import { useQuery } from '@tanstack/react-query';

import { mockPortfolio } from '../mocks/mockPortfolio';
import { PortfolioResponse } from '../types';

export const usePortfolio = () => {
  // return { isFetched: false, data: mockPortfolio };

  return useQuery<PortfolioResponse>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      return mockPortfolio;
      try {
        const response = await fetch(`http://127.0.0.1:8716/portfolio`);
        return response.json();
      } catch {
        return {};
      }
    },
    refetchInterval: 1000,
  });
};
