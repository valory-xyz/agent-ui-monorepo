import { CurrencyCode } from './constants/currency';

export type Features = {
  isChatEnabled: boolean;
};

export type TradingType = 'risky' | 'balanced';

/**
 * Chat response from the agent.
 */
export type ChatResponse = {
  reasoning: string;
  trading_type: TradingType;
  previous_trading_type?: TradingType;
};

export type AgentDetailsResponse = {
  agent_id: string;
  created_at: string;
  last_active_at: string;
};

export type TradingDetailsResponse = {
  agent_id: string;
  trading_type: TradingType;
};

export type AgentWindow = '7d' | '30d' | '90d' | 'lifetime';

export type AgentMetricsResponse = {
  agent_id: string;
  /** e.g. "lifetime", "7d", "30d" */
  window: AgentWindow;
  currency: 'USD'; // other currencies may be added in the future
  metrics: {
    all_time_funds_used: number;
    all_time_profit: number;
    funds_locked_in_markets: number;
    available_funds: number;
  };
  stats: {
    predictions_made: number;
    /** 0-1 (e.g. 0.53 = 53%) */
    prediction_accuracy: number;
  };
};

export type PredictionStatus = 'pending' | 'won' | 'lost';

export type PredictionSide = 'yes' | 'no';

export type PredictionHistoryItem = {
  id: string;
  market: {
    id: string;
    title: string;
    external_url: string;
  };
  prediction_side: PredictionSide;
  /** amount placed on this prediction */
  bet_amount: number;
  status: PredictionStatus;
  /** gross_reward - bet_amount */
  net_profit: number;
  /** ISO 8601 timestamp */
  created_at: string;
  /** ISO 8601 timestamp or null while pending */
  settled_at: string | null; // null while pending
};

export type AgentPredictionHistoryResponse = {
  agent_id: string;
  currency: CurrencyCode;
  page: number;
  page_size: number;
  total: number;
  items: PredictionHistoryItem[];
};

export type ProfitOverTime = {
  timestamp: string;
  delta_profit: number;
};

export type AgentProfitPoint = {
  /** ISO 8601 timestamp */
  timestamp: string;
  delta_profit: number;
};

export type AgentProfitTimeseriesResponse = {
  agent_id: string;
  currency: string;
  window: AgentWindow;
  points: AgentProfitPoint[];
};
