type Address = `0x${string}`;

type Allocation = {
  id: string;
  chain: 'ethereum' | 'mode' | 'optimism';
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

export type SelectedProtocol = 'balancerPool' | 'sturdy' | 'velodrome' | 'uniswapV3';

/**
 * Portfolio response from the agent.
 */
export type PortfolioResponse = {
  address?: Address;
  portfolio_value: number;
  roi: number;
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

export type WithdrawalFunds = {
  /** e.g., 1,500 USDC in smallest unit (e.g., 1,500,000,000) */
  amount: number;
  /** e.g., 1,500 USDC */
  total_value_usd: number;
  asset_breakdown: {
    token_symbol: string;
    /** e.g., 0.5 ETH or 500 USDC */
    value: number;
    /** e.g., $750 */
    value_usd: number;
  }[];
};

type FundsWithdrawalStatus = 'initiated' | 'withdrawing' | 'completed' | 'failed';

export type WithdrawalInitiateResponse = {
  id: string;
  status: FundsWithdrawalStatus;
  target_address: Address;
  estimated_value_usd: number;
  chain: 'mode' | 'optimism';
};

export type WithdrawalStatus = {
  status: FundsWithdrawalStatus;
  message: string;
  target_address: Address;
  chain: 'mode' | 'optimism';
  safe_address: Address;
  requested_at: string;
  estimated_value_usd: number;
  transaction_link: string | null;
};
