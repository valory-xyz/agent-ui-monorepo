import { useQuery } from '@tanstack/react-query';

import { IS_MOCK_ENABLED } from '../mocks/config';
import { mockPortfolio } from '../mocks/mockPortfolio';
import { PortfolioResponse } from '../types';

export const usePortfolio = () =>
  useQuery<PortfolioResponse>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockPortfolio);
          }, 2000);
        });
      }

      try {
        const response = await fetch(`http://127.0.0.1:8716/portfolio`);
        return response.json();
      } catch {
        return {};
      }
    },
    refetchInterval: 1000,
  });
