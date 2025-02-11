import { useQuery } from '@tanstack/react-query';

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

export interface Portfolio {
  'portfolio-value': number;
  allocations: Allocation[];
  'portfolio-breakdown': PortfolioAsset[];
}

export const usePortfolio = () =>
  useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:${process.env.REACT_APP_API_PORT}/portfolio`,
      );
      return response.json();
    },
    refetchInterval: 1000,
  });
