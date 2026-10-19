import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { Agent } from '../../src/app/agent';
import { useAgentDetails } from '../../src/hooks/useAgentDetails';
import { getMockLeaderboard } from '../../src/mocks/mockLeaderboard';
import { getMockProfitOverTime } from '../../src/mocks/mockProfitOverTime';
import { mockTradeHistory } from '../../src/mocks/mockTradeHistory';
import { mockTradingDetails } from '../../src/mocks/mockTradingDetails';
import { mockWithdrawalStatus } from '../../src/mocks/mockWithdrawal';

jest.mock('../../src/hooks/useAgentDetails');

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const createWrapper = (queryClient = createQueryClient()) => {
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

describe('Agent', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders loading skeletons when isLoading=true', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: { agentDetails: undefined, performance: undefined },
    });
    const { container } = render(<Agent />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('renders error state when isError=true', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: { agentDetails: undefined, performance: undefined },
    });
    render(<Agent />, { wrapper: createWrapper() });
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });

  it('renders not-found state when data is missing', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: undefined, performance: undefined },
    });
    render(<Agent />, { wrapper: createWrapper() });
    expect(screen.getByText('404 | Agent not found')).toBeInTheDocument();
  });

  it('renders full content when data is available', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: mockAgentDetails, performance: mockPerformance },
    });
    render(<Agent />, { wrapper: createWrapper() });
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('renders the Leaderboard card between Performance and Profit Over Time', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: mockAgentDetails, performance: mockPerformance },
    });
    render(<Agent />, { wrapper: createWrapper() });
    const performance = screen.getByText('Performance');
    const leaderboard = screen.getByRole('heading', { name: 'Leaderboard' });
    const profitOverTime = screen.getByText('Profit Over Time');
    expect(performance.compareDocumentPosition(leaderboard)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(leaderboard.compareDocumentPosition(profitOverTime)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("does not render the chat (Update agent's goal) section or fetch its features", async () => {
    const responses: Record<string, unknown> = {
      '/agent/leaderboard': getMockLeaderboard('30d'),
      '/agent/profit-over-time': getMockProfitOverTime('lifetime'),
      '/agent/prediction-history': mockTradeHistory,
      '/agent/trading-details': mockTradingDetails,
      '/withdrawal': mockWithdrawalStatus,
    };
    const fetchMock = jest.fn((url: string) => {
      const path = Object.keys(responses).find((key) => url.includes(key));
      return Promise.resolve({
        ok: path !== undefined,
        json: () => Promise.resolve(path ? responses[path] : {}),
      });
    });
    global.fetch = fetchMock;
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: mockAgentDetails, performance: mockPerformance },
    });
    const queryClient = createQueryClient();
    render(<Agent />, { wrapper: createWrapper(queryClient) });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(fetchMock.mock.calls.map(([url]) => url)).not.toContainEqual(
      expect.stringContaining('/features'),
    );
    expect(screen.queryByText("Update agent's goal")).toBeNull();
  });
});
