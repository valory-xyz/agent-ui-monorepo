import { PositionDetails } from '../types';

export const mockPositionDetails: PositionDetails = {
  id: 'pos_123',
  question: 'Will the National Development and Reform Commission of China ...?',
  currency: 'USD',
  total_bet: 1.82,
  to_win: 2.04,
  status: 'pending',
  remaining_seconds: 240000,
  net_profit: 0,
  bets: [
    {
      bet: {
        amount: 1.82,
        side: 'yes',
        external_url: 'https://example.com/market/market_abcd',
        placed_at: '2025-12-09T17:55:00.000Z',
      },
      probability: 0.64,
      strategy: 'risky',
    },
  ],
};
