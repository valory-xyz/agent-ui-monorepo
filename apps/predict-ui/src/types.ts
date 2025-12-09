import { CurrencyCode } from './constants/currency';

export type TraderAgent = {
  id: string;
  serviceId: string;
  firstParticipation: string;
  totalBets: number;
  totalTraded: string;
  totalPayout: string;
  totalFees: string;
  bets: {
    timestamp: number | string;
  }[];
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
};

export type TraderAgentBets = {
  id: string;
  bets: {
    outcomeIndex: string;
    fixedProductMarketMaker: {
      id: string;
      currentAnswer: string;
    };
  }[];
};

export type GetUserTradesParams = {
  creator: string;
  first: number;
  skip: number;
  orderBy: string;
  orderDirection: string;
};

type Fpmm = {
  id: string;
  outcomes: string[];
  currentAnswer: string;
  openingTimestamp: number;
};

export type FpmmTrade = {
  id: string;
  collateralAmountUSD: string;
  creationTimestamp: number;
  outcomeIndex: number;
  fpmm: Fpmm;
  title: string | null;
  transactionHash: string;
};

export type FpmmTrades = { fpmmTrades: FpmmTrade[] };

export type GetMechSenderParams = {
  id: string;
  timestamp_gt: number;
};

export type MechSender = {
  totalRequests: number;
  requests: {
    id: string;
    questionTitle: string;
  }[];
};

export type Question = {
  id: string;
  question: string;
};

export type Service = {
  id: string;
  olasRewardsEarned: string;
};

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
  trading_type: TradingType;
};

export type AgentMetricsResponse = {
  agent_id: string;
  /** e.g. "lifetime", "7d", "30d" */
  window: '7d' | '30d' | '90d' | 'lifetime';
  currency: 'USD'; // other currencies may be added in the future
  metrics: {
    all_time_funds_used: number;
    all_time_profit: number;
    funds_locked_in_markets: number;
    available_funds: number;
  };
  stats: {
    predictions_made: number;
    prediction_accuracy: number; // 0–1 (e.g. 0.53 = 53%)
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
