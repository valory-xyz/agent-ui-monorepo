import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { ProfitOverTime } from '../../../src/components/ProfitOverTime/ProfitOverTime';
import { useProfitOverTime } from '../../../src/hooks/useProfitOverTime';

jest.mock('../../../src/hooks/useProfitOverTime');

// Recharts uses ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('ProfitOverTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the heading "Profit Over Time"', () => {
    (useProfitOverTime as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: undefined,
    });
    render(<ProfitOverTime />, { wrapper: createWrapper() });
    expect(screen.getByText('Profit Over Time')).toBeTruthy();
  });

  it('shows a loading spinner when isLoading=true', () => {
    (useProfitOverTime as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });
    const { container } = render(<ProfitOverTime />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('shows error message when isError=true', () => {
    (useProfitOverTime as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });
    render(<ProfitOverTime />, { wrapper: createWrapper() });
    expect(screen.getByText('Failed to load profit data.')).toBeTruthy();
  });

  it('shows empty state when data has no points', () => {
    (useProfitOverTime as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agent_id: 'a', currency: 'USD', window: '7d', points: [] },
    });
    render(<ProfitOverTime />, { wrapper: createWrapper() });
    expect(screen.getByText('No data yet.')).toBeTruthy();
  });

  it('renders chart when data has points', () => {
    (useProfitOverTime as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        agent_id: 'a',
        currency: 'USD',
        window: '7d',
        points: [
          { timestamp: '2025-01-01T00:00:00Z', delta_profit: 1.5 },
          { timestamp: '2025-01-02T00:00:00Z', delta_profit: -0.5 },
        ],
      },
    });
    const { container } = render(<ProfitOverTime />, { wrapper: createWrapper() });
    // Recharts renders a responsive container
    expect(container.querySelector('.recharts-responsive-container')).toBeTruthy();
  });

  it('hides window switcher when no data points', () => {
    (useProfitOverTime as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { agent_id: 'a', currency: 'USD', window: '7d', points: [] },
    });
    render(<ProfitOverTime />, { wrapper: createWrapper() });
    // Segmented control (window switcher) should not be present
    expect(screen.queryByText('7D')).toBeNull();
  });

  it('shows window switcher when data has points', () => {
    (useProfitOverTime as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        agent_id: 'a',
        currency: 'USD',
        window: '7d',
        points: [{ timestamp: '2025-01-01T00:00:00Z', delta_profit: 1.0 }],
      },
    });
    render(<ProfitOverTime />, { wrapper: createWrapper() });
    expect(screen.getByText('7D')).toBeTruthy();
  });
});
