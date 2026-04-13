import { TradeDetails } from '../../src/types';

export const baseTrade: TradeDetails = {
  id: 'bet_001',
  bet: {
    amount: 1.5,
    side: 'yes',
    placed_at: '2025-11-25T17:55:00.000Z',
  },
  intelligence: {
    prediction_tool: 'prediction-online',
    implied_probability: 75.3,
    confidence_score: 85.7,
    utility_score: 60.2,
  },
  strategy: 'risky',
};
