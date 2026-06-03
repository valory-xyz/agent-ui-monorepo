// Polystrat agent with metrics restored (ARE_POLYSTRAT_METRICS_AVAILABLE=true).
// Verifies the flag cleanly reverts to the full metrics UI.
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

jest.mock('../../src/constants/featureFlags', () => ({
  ARE_POLYSTRAT_METRICS_AVAILABLE: true,
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

describe('Agent – polystrat agent, metrics available', () => {
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

  it('renders the metric sections and the incomplete-data alert', () => {
    render(<Agent />, { wrapper: createWrapper() });
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(
      screen.getByText('Some performance data may be incomplete'),
    ).toBeInTheDocument();
  });

  it('does not render the metrics-unavailable card', () => {
    render(<Agent />, { wrapper: createWrapper() });
    expect(
      screen.queryByText('Activity data unavailable in this app version'),
    ).toBeNull();
  });
});
