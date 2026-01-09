import { AgentProfitTimeseriesResponse, AgentWindow } from '../types';

const getRandomDeltaProfit = (numberOfPoints: number) =>
  Array.from({ length: numberOfPoints }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (numberOfPoints - 1 - i));
    return {
      timestamp: date.toISOString(),
      delta_profit: parseFloat((Math.random() * 10 - 2).toFixed(2)),
    };
  });

export const getMockProfitOverTime = (window: AgentWindow): AgentProfitTimeseriesResponse => {
  if (window === '90d') {
    return {
      agent_id: 'agent_123',
      currency: 'USD',
      window: '90d',
      points: getRandomDeltaProfit(90),
    };
  }

  if (window === '30d') {
    return {
      agent_id: 'agent_123',
      currency: 'USD',
      window: '30d',
      points: getRandomDeltaProfit(30),
    };
  }

  return {
    agent_id: 'agent_123',
    currency: 'USD',
    window: '7d',
    points: [
      { timestamp: '2025-07-18T00:00:00Z', delta_profit: 0.3 },
      { timestamp: '2025-07-19T00:00:00Z', delta_profit: 0 },
      { timestamp: '2025-07-19T12:00:00Z', delta_profit: -2.5 },
      { timestamp: '2025-07-20T00:00:00Z', delta_profit: 1.2 },
      { timestamp: '2025-07-21T00:00:00Z', delta_profit: 0.4 },
      { timestamp: '2025-07-22T00:00:00Z', delta_profit: 3.0 },
      { timestamp: '2025-07-25T00:00:00Z', delta_profit: 0.5 },
    ],
  };
};
