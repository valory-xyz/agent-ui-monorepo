import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { Agent } from '../../src/app/agent';
import { useAgentDetails } from '../../src/hooks/useAgentDetails';
import { useFeatures } from '../../src/hooks/useFeatures';

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

describe('Agent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFeatures as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { isChatEnabled: false },
    });
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

  it('renders UnlockChat when isChatEnabled=false and features loaded', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: mockAgentDetails, performance: mockPerformance },
    });
    (useFeatures as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { isChatEnabled: false },
    });
    render(<Agent />, { wrapper: createWrapper() });
    expect(screen.getByText("Update agent's goal")).toBeInTheDocument();
  });

  it('renders Chat when isChatEnabled=true', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: mockAgentDetails, performance: mockPerformance },
    });
    (useFeatures as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { isChatEnabled: true },
    });
    render(<Agent />, { wrapper: createWrapper() });
    expect(screen.getByTestId('chat-mock')).toBeInTheDocument();
  });

  it('shows nothing for ChatContent when features are loading', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agentDetails: mockAgentDetails, performance: mockPerformance },
    });
    (useFeatures as jest.Mock).mockReturnValue({ isLoading: true, data: undefined });
    render(<Agent />, { wrapper: createWrapper() });
    // When features are loading, ChatContent returns null
    expect(screen.queryByText("Update agent's goal")).toBeNull();
  });
});
