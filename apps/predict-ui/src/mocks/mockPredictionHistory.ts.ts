import { AgentPredictionHistoryResponse } from '../types';

export const mockPredictionHistory: AgentPredictionHistoryResponse = {
  agent_id: 'agent_123',
  currency: 'USD',
  page: 1,
  page_size: 10,
  total: 225,
  items: [
    {
      id: 'pred_001',
      market: {
        id: 'market_abcd',
        title: 'Will the National Development and Reform Commission of China, ...',
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
          'Will OpenAI publicly report, on or before November 29, 2025, that more than 200,000 verified US K–12 educator...',
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
        title: 'Will any major cloud provider ...',
        external_url: 'https://example.com/market/market_2',
      },
      prediction_side: 'yes',
      bet_amount: 0.025,
      status: 'won',
      net_profit: 0.05,
      created_at: '2025-11-18T11:02:00Z',
      settled_at: '2025-11-24T07:55:00Z',
    },
  ],
} as const;
