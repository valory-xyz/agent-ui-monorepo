import { PositionDetails } from '../types';

export const mockPositionDetails: PositionDetails = {
  id: 'pos_123',
  question: 'Will the National Development and Reform Commission of China ...?',
  currency: 'USD',
  totalBet: 1.82,
  toWin: 2.04,
  status: 'pending',
  remainingSeconds: 240000,
  net_profit: 0,
  bets: [
    {
      bet: {
        amount: 1.82,
        side: 'yes',
        externalUrl: 'https://example.com/market/market_abcd',
        placedAt: '2025-12-09T17:55:00.000Z',
      },
      probability: 0.64,
      strategy: 'risky',
    },
  ],
};
