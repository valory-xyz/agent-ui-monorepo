import { mockAgentDetails } from '../../src/mocks/mockAgentDetails';
import { mockPerformance } from '../../src/mocks/mockPerformance';
import { getMockProfitOverTime } from '../../src/mocks/mockProfitOverTime';
import { mockPositionDetails, mockTradeHistory } from '../../src/mocks/mockTradeHistory';
import { mockTradingDetails } from '../../src/mocks/mockTradingDetails';

describe('predict-ui mock data', () => {
  it('matches the expected structural shape', () => {
    expect(mockAgentDetails.id).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(mockPerformance.currency).toBe('USD');
    expect(getMockProfitOverTime('7d').points).toHaveLength(7);
    expect(getMockProfitOverTime('30d').points).toHaveLength(30);
    expect(getMockProfitOverTime('90d').points).toHaveLength(90);
    expect(mockTradeHistory.items.length).toBeGreaterThan(0);
    expect(mockPositionDetails.bets.length).toBeGreaterThan(0);
    expect(mockTradingDetails.trading_type_description.length).toBeGreaterThan(0);
  });
});
