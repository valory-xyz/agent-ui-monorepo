// Mock agentMap to simulate polystrat environment (isPolystratAgent=true)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { Agent } from '../../src/app/agent';
import { useAgentDetails } from '../../src/hooks/useAgentDetails';
import { useFeatures } from '../../src/hooks/useFeatures';

jest.mock('../../src/utils/agentMap', () => ({
  agentType: 'polystrat_trader',
  isOmenstratAgent: false,
  isPolystratAgent: true,
}));

jest.mock('../../src/hooks/useAgentDetails');
jest.mock('../../src/hooks/useFeatures');
jest.mock('../../src/components/Chat/Chat', () => ({
  Chat: () => <div data-testid="chat-mock">Chat</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockAgentDetails = {
  id: '0xabc',
  created_at: '2024-01-01T00:00:00Z',
  last_active_at: '2024-06-01T00:00:00Z',
};

const mockPerformance = {
  agent_id: '0xabc',
  window: 'lifetime',
  currency: 'USD',
  metrics: {
    all_time_funds_used: 20,
    all_time_profit: 2,
    funds_locked_in_markets: 0.1,
    available_funds: 10,
    roi: 0.1,
  },
  stats: { predictions_made: 100, prediction_accuracy: 0.5 },
};

// Metrics are unavailable by default (ARE_POLYSTRAT_METRICS_AVAILABLE=false).
describe('Agent – polystrat agent, metrics unavailable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFeatures as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { isChatEnabled: false },
    });
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: mockAgentDetails, performance: mockPerformance },
    });
  });

  it('renders the metrics-unavailable card instead of the metric sections', () => {
    render(<Agent />, { wrapper: createWrapper() });
    expect(
      screen.getByText('Activity data unavailable in this app version'),
    ).toBeInTheDocument();
    expect(screen.getByText('View agent activity')).toBeInTheDocument();
  });

  it('does not render the metric sections or the incomplete-data alert', () => {
    render(<Agent />, { wrapper: createWrapper() });
    expect(screen.queryByText('Performance')).toBeNull();
    expect(screen.queryByText('Profit Over Time')).toBeNull();
    expect(screen.queryByText('Trade History')).toBeNull();
    expect(
      screen.queryByText('Some performance data may be incomplete'),
    ).toBeNull();
  });

  it('still renders the non-metric sections (strategy, withdraw)', () => {
    render(<Agent />, { wrapper: createWrapper() });
    expect(
      screen.getByText('Withdraw funds locked in markets'),
    ).toBeInTheDocument();
  });
});
