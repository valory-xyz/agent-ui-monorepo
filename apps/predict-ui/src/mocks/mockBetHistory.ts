import { AgentPredictionHistoryResponse } from '../types';
import { PositionDetails } from '../types';

export const mockBetHistory: AgentPredictionHistoryResponse = {
  agent_id: 'agent_123',
  currency: 'USD',
  page: 1,
  page_size: 10,
  total: 5,
  items: [
    {
      id: 'pred_001',
      market: {
        id: 'market_abcd',
        title:
          'Will the National Development and Reform Commission of China, on or before November 30, 2025, implement new policies to promote sustainable development?',
        external_url: 'https://example.com/market/market_abcd',
      },
      prediction_side: 'yes',
      bet_amount: 0.025,
      status: 'pending',
      net_profit: 0.0,
      created_at: '2025-11-20T14:05:00Z',
      settled_at: null,
    },
    {
      id: 'pred_002',
      market: {
        id: 'market_1',
        title:
          'Will OpenAI publicly report, on or before November 29, 2025, that more than 200,000 verified US K–12 educators have used ChatGPT for educational purposes?',
        external_url: 'https://example.com/market/market_1',
      },
      prediction_side: 'no',
      bet_amount: 0.025,
      status: 'lost',
      net_profit: -0.025,
      created_at: '2025-11-19T09:33:00Z',
      settled_at: '2025-11-23T18:20:00Z',
    },
    {
      id: 'pred_003',
      market: {
        id: 'market_2',
        title:
          'Will any major cloud provider, on or before November 28, 2025, announce a significant reduction in carbon emissions?',
        external_url: 'https://example.com/market/market_2',
      },
      prediction_side: 'yes',
      bet_amount: 0.025,
      status: 'won',
      net_profit: 0.05,
      created_at: '2025-11-18T11:02:00Z',
      settled_at: '2025-11-24T07:55:00Z',
    },
    {
      id: 'pred_004',
      market: {
        id: 'market_3',
        title:
          'Will a Fortune 100 company announce a major AI model release before December 15, 2025?',
        external_url: 'https://example.com/market/market_3',
      },
      prediction_side: 'no',
      bet_amount: 0.015,
      status: 'pending',
      net_profit: 0.0,
      created_at: '2025-11-17T08:15:00Z',
      settled_at: null,
    },
    {
      id: 'pred_005',
      market: {
        id: 'market_4',
        title: 'Will Bitcoin close above $50,000 on December 31, 2025?',
        external_url: 'https://example.com/market/market_4',
      },
      prediction_side: 'yes',
      bet_amount: 0.05,
      status: 'won',
      net_profit: 0.12,
      created_at: '2025-11-16T13:45:00Z',
      settled_at: '2025-12-01T16:10:00Z',
    },
  ],
} as const;

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
