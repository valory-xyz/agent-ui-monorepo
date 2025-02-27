type Allocation = {
  id: string;
  chain: 'ethereum' | 'mode';
  address?: `0x${string}`;
  type: string;
  assets: string[];
  apr: number;
  details: string;
  ratio: number;
};

type PortfolioAsset = {
  asset: string;
  address?: `0x${string}`;
  value_usd: number;
  balance: number;
  ratio: number;
  price: number;
};

export type TradingType = 'risky' | 'balanced';

export type SelectedProtocol = 'balancerPool' | 'sturdy';

/**
 * Portfolio response from the agent.
 */
export type PortfolioResponse = {
  address?: `0x${string}`;
  portfolio_value: number;
  allocations: Allocation[];
  portfolio_breakdown: PortfolioAsset[];
  trading_type: TradingType;
  selected_protocols: SelectedProtocol[];
};

/**
 * Chat response from the agent.
 */
export type ChatResponse = {
  reasoning: string;
  trading_type: TradingType;
  previous_trading_type?: TradingType;
  selected_protocols: SelectedProtocol[];
};
