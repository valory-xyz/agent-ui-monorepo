import { useQuery } from '@tanstack/react-query';

import { mockPortfolio } from '../mocks/mockPortfolio';

export interface Allocation {
  type: string;
  assets: string[];
  apr: number;
  details: string;
  ratio: number;
}

export interface PortfolioAsset {
  asset: string;
  balance: number;
  ratio: number;
  price: number;
}

export interface PortfolioResponse {
  address?: `0x${string}`;
  'portfolio-value': number;
  allocations: Allocation[];
  'portfolio-breakdown': PortfolioAsset[];
}

export const usePortfolio = () =>
  useQuery<PortfolioResponse>({
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
