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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockPortfolio = {
  'portfolio-value': 100000,
  allocations: [
    {
      type: 'stable-USDC-USDT-Curve LP',
      assets: ['USDC', 'USDT'],
      details: 'Curve LP',
      apr: 4.5,
      ratio: 0.25,
    },
    {
      type: 'stable-DAI-USDC-Aave lending',
      assets: ['DAI', 'USDC'],
      details: 'Aave lending',
      apr: 3.8,
      ratio: 0.25,
    },
    {
      type: 'eth-stETH-rETH-Balancer pool',
      assets: ['stETH', 'rETH'],
      details: 'Balancer pool',
      apr: 5.2,
      ratio: 0.5,
    },
  ],
  'portfolio-breakdown': [
    {
      asset: 'USDC',
      balance: 25000,
      ratio: 0.3,
      price: 1,
    },
    {
      asset: 'USDT',
      balance: 25000,
      ratio: 0.3,
      price: 1,
    },
    {
      asset: 'DAI',
      balance: 25000,
      ratio: 0.2,
      price: 1,
    },
    {
      asset: 'stETH',
      balance: 15000,
      ratio: 0.15,
      price: 2000,
    },
    {
      asset: 'rETH',
      balance: 10000,
      ratio: 0.05,
      price: 2000,
    },
  ],
};

export const usePortfolio = () =>
  useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      // return mockPortfolio;
      const response = await fetch(
        `http://localhost:${process.env.REACT_APP_API_PORT}/portfolio`,
      );
      return response.json();
    },
    refetchInterval: 1000,
  });
