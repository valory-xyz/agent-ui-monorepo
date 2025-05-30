import { PortfolioResponse } from '../types';
import { agentChainName, agentType } from '../utils/agentMap';

export const mockAgentAsset = agentType === 'modius' ? 'MODE' : 'OP';

export const mockPortfolio: PortfolioResponse = {
  address: '0x000000000000000000000000000000000000dEaD',
  portfolio_value: 849585.8579967507,
  allocations: [
    {
      chain: agentChainName,
      type: 'balancerPool',
      id: '0x7c86a44778c52a0aad17860924b53bf3f35dc932000200000000000000000007',
      assets: ['WETH', mockAgentAsset, 'USDC'],
      apr: 5.96,
      details: `Balancer 80${mockAgentAsset}/20wETH`,
      ratio: 10.0,
      address: '0x140A58BC06338ec49d46266DA3888548983Ce003',
    },
    {
      chain: 'ethereum',
      type: 'sturdy',
      id: '0xAeD098db0e39bed6DDc2c07727B8FfC0BA470D9C',
      assets: ['tBTC'],
      apr: 12.01,
      details: 'tBTC aggregator',
      ratio: 100.0,
      address: '0x553Ce54DE9b219ecFfa9B65AEF49597c884AC64a',
    },
  ],
  portfolio_breakdown: [
    {
      asset: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      balance: 62.179373541121656,
      price: 2738.82,
      value_usd: 170298.11184189483,
      ratio: 0.200448,
    },
    {
      asset: mockAgentAsset,
      address: '0xDfc7C877a950e49D2610114102175A06C2e3167a',
      balance: 59146006.65000621,
      price: 0.01148493,
      value_usd: 679287.7461548559,
      ratio: 0.799552,
    },
    {
      asset: 'tBTC',
      address: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
      balance: 0.0,
      price: 97327.0,
      value_usd: 0.0,
      ratio: 0.0,
    },
  ],
  selected_protocols: ['balancerPool', 'sturdy', 'velodrome'],
  trading_type: 'balanced',
} as const;
