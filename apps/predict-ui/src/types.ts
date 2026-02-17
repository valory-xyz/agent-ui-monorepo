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
  trading_type_description: string;
};

export type AgentWindow = '7d' | '30d' | '90d' | 'lifetime';

export type AgentMetricsResponse = {
  agent_id: string;
  window: AgentWindow;
  currency: 'USD'; // other currencies may be added in the future
  metrics: {
    all_time_funds_used: number;
    all_time_profit: number;
    funds_locked_in_markets: number;
    available_funds: number;
    roi: number;
  };
  stats: {
    predictions_made: number;
    /**
     * 0-1 (e.g. 0.53 = 53%).
     * `null` indicates no data available
     */
    prediction_accuracy: number | null;
  };
};

export type PredictionStatus = 'pending' | 'won' | 'lost' | 'invalid';

export type PredictionSide = 'yes' | 'no';

export type TradeHistoryItem = {
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
  settled_at: string | null;
};

export type AgentPredictionHistoryResponse = {
  agent_id: string;
  currency: CurrencyCode;
  page: number;
  page_size: number;
  total: number;
  items: TradeHistoryItem[];
};

type PositionSide = 'yes' | 'no';

export type TradeDetails = {
  id: string;
  bet: {
    amount: number;
    side: PositionSide;
    external_url?: string;
    placed_at?: string; // ISO 8601 timestamp (date and time)
  };
  intelligence: {
    prediction_tool: string | null;
    implied_probability: number;
    confidence_score: number;
    utility_score: number;
  };
  strategy: TradingType | null;
};

export type PositionDetails = {
  id: string;
  question: string;
  currency: CurrencyCode;
  total_bet: number;
  payout: number;
  /** For pending status, display remaining_seconds; for won/lost/invalid, display net_profit */
  status: PredictionStatus;
  /** time left in seconds */
  remaining_seconds?: number;
  net_profit: number;
  bets: Array<TradeDetails>;
  external_url: string;
};

export type AgentProfitPoint = {
  /** ISO 8601 timestamp */
  timestamp: string;
  delta_profit: number;
};

export type AgentProfitTimeseriesResponse = {
  agent_id: string;
  currency: CurrencyCode;
  window: AgentWindow;
  points: AgentProfitPoint[];
};
