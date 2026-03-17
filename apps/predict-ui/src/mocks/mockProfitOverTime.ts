import { AgentProfitTimeseriesResponse, AgentWindow } from '../types';

const getRandomCumulativeProfit = (numberOfPoints: number) => {
  const points: { timestamp: string; cumulative_profit: number }[] = [];
  let cumulative = 0;
  for (let i = 0; i < numberOfPoints; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (numberOfPoints - 1 - i));
    if (i === 0) {
      // Ensure the series begins at $0 as per UI copy
      cumulative = 0;
    } else {
      // Generate a random profit/loss delta and accumulate it
      const delta = parseFloat(((Math.random() - 0.5) * 10).toFixed(2)); // range approx [-5, 5]
      cumulative = parseFloat((cumulative + delta).toFixed(2));
    }
    points.push({
      timestamp: date.toISOString(),
      cumulative_profit: cumulative,
    });
  }
  return points;
};

export const getMockProfitOverTime = (window: AgentWindow): AgentProfitTimeseriesResponse => {
  if (window === '90d') {
    return {
      agent_id: 'agent_123',
      currency: 'USD',
      window: '90d',
      points: getRandomCumulativeProfit(90),
    };
  }

  if (window === '30d') {
    return {
      agent_id: 'agent_123',
      currency: 'USD',
      window: '30d',
      points: getRandomCumulativeProfit(30),
    };
  }

  return {
    agent_id: 'agent_123',
    currency: 'USD',
    window: '7d',
    points: [
      { timestamp: '2025-07-18T00:00:00Z', cumulative_profit: 0.3 },
      { timestamp: '2025-07-19T00:00:00Z', cumulative_profit: 0 },
      { timestamp: '2025-07-19T12:00:00Z', cumulative_profit: -2.5 },
      { timestamp: '2025-07-20T00:00:00Z', cumulative_profit: 1.2 },
      { timestamp: '2025-07-21T00:00:00Z', cumulative_profit: 0.4 },
      { timestamp: '2025-07-22T00:00:00Z', cumulative_profit: 3.0 },
      { timestamp: '2025-07-25T00:00:00Z', cumulative_profit: 0.5 },
    ],
  };
};
