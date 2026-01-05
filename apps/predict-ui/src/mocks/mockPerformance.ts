import { AgentMetricsResponse } from '../types';

export const mockPerformance: AgentMetricsResponse = {
  agent_id: 'agent_123',
  window: 'lifetime',
  currency: 'USD',
  metrics: {
    all_time_funds_used: 20.55,
    all_time_profit: 2.1,
    funds_locked_in_markets: 0.125,
    available_funds: 10.9,
    roi: 0.44,
  },
  stats: {
    predictions_made: 1002,
    prediction_accuracy: 0.53,
  },
} as const;
