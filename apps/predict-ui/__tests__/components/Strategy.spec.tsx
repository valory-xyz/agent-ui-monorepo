import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { Strategy } from '../../src/components/Strategy';
import { useTradingDetails } from '../../src/hooks/useTradingDetails';

jest.mock('../../src/hooks/useTradingDetails');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Strategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading skeleton when isLoading=true', () => {
    (useTradingDetails as jest.Mock).mockReturnValue({ isLoading: true, data: undefined });
    const { container } = render(<Strategy />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-skeleton')).toBeTruthy();
  });

  it('shows strategy name and description when data is available', () => {
    (useTradingDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        agent_id: '0xabc',
        trading_type: 'balanced',
        trading_type_description: 'Balanced risk and reward.',
      },
    });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getByText('Balanced')).toBeTruthy();
    expect(screen.getByText('Balanced risk and reward.')).toBeTruthy();
  });

  it('shows n/a when data has no trading_type', () => {
    (useTradingDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: undefined,
    });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getByText('n/a')).toBeTruthy();
  });

  it('renders the "Strategy" header label', () => {
    (useTradingDetails as jest.Mock).mockReturnValue({ isLoading: false, data: undefined });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getByText('Strategy')).toBeTruthy();
  });

  it('renders risky strategy correctly', () => {
    (useTradingDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        agent_id: '0xabc',
        trading_type: 'risky',
        trading_type_description: 'High risk approach.',
      },
    });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getByText('Risky')).toBeTruthy();
    expect(screen.getByText('High risk approach.')).toBeTruthy();
  });
});
