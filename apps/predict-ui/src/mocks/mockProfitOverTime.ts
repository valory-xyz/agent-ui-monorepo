import { AgentProfitTimeseriesResponse } from '../types';

export const mockProfitOverTime: AgentProfitTimeseriesResponse = {
  agent_id: 'agent_123',
  currency: 'USD',
  window: '7d',
  points: [],
  // points: [
  //   {
  //     timestamp: '2025-07-18T00:00:00Z',
  //     delta_profit: 0.3,
  //   },
  //   {
  //     timestamp: '2025-07-19T00:00:00Z',
  //     delta_profit: 0,
  //   },
  //   {
  //     timestamp: '2025-07-19T12:00:00Z',
  //     delta_profit: -2.5,
  //   },
  //   {
  //     timestamp: '2025-07-20T00:00:00Z',
  //     delta_profit: 1.2,
  //   },
  //   {
  //     timestamp: '2025-07-21T00:00:00Z',
  //     delta_profit: 0.4,
  //   },
  //   {
  //     timestamp: '2025-07-22T00:00:00Z',
  //     delta_profit: 3.0,
  //   },
  //   {
  //     timestamp: '2025-07-23T00:00:00Z',
  //     delta_profit: -1.0,
  //   },
  //   {
  //     timestamp: '2025-07-24T00:00:00Z',
  //     delta_profit: 2.3,
  //   },
  //   {
  //     timestamp: '2025-07-25T00:00:00Z',
  //     delta_profit: 0.5,
  //   },
  // ],
} as const;
