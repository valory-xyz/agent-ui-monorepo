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

const mockPortfolio = {
  allocations: [
    {
      key: 'stable-USDC-USDT-Curve LP',
      assets: ['USDC', 'USDT'],
      details: 'Curve LP',
      apr: 4.5,
      ratio: 0.25,
    },
    {
      key: 'stable-DAI-USDC-Aave lending',
      assets: ['DAI', 'USDC'],
      details: 'Aave lending',
      apr: 3.8,
      ratio: 0.25,
    },
    {
      key: 'eth-stETH-rETH-Balancer pool',
      assets: ['stETH', 'rETH'],
      details: 'Balancer pool',
      apr: 5.2,
      ratio: 0.5,
    },
  ],
};

export const usePortfolio = () =>
  useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      return mockPortfolio;
      const response = await fetch(
        `http://localhost:${process.env.REACT_APP_API_PORT}/portfolio`,
      );
      return response.json();
    },
    refetchInterval: 1000,
  });
