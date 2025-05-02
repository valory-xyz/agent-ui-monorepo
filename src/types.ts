type Address = `0x${string}`;

type Allocation = {
  id: string;
  chain: 'ethereum' | 'mode';
  address?: Address;
  type: SelectedProtocol;
  assets: string[];
  apr: number;
  details: string;
  ratio: number;
};

type PortfolioAsset = {
  asset: string;
  address?: Address;
  value_usd: number;
  balance: number;
  ratio: number;
  price: number;
};

export type TradingType = 'risky' | 'balanced';

export type SelectedProtocol = 'balancerPool' | 'sturdy' | 'velodrome';

/**
 * Portfolio response from the agent.
 */
export type PortfolioResponse = {
  address?: Address;
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

export type Features = {
  isChatEnabled: boolean;
};
