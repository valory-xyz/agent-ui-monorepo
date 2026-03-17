import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { BreakdownModal } from '../../../src/components/Portfolio/BreakdownModal';

jest.mock('../../../src/hooks/usePortfolio');

const { usePortfolio } = jest.requireMock('../../../src/hooks/usePortfolio') as {
  usePortfolio: jest.Mock;
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('BreakdownModal', () => {
  it('renders modal title when open', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<BreakdownModal open={true} />, { wrapper: createWrapper() });
    expect(screen.getByText('Portfolio breakdown')).toBeTruthy();
  });

  it('shows "No data available" when data is null', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<BreakdownModal open={true} />, { wrapper: createWrapper() });
    expect(screen.getByText('No data available.')).toBeTruthy();
  });

  it('renders table with breakdown data', () => {
    usePortfolio.mockReturnValue({
      data: {
        portfolio_breakdown: [
          { asset: 'ETH', balance: 0.5, price: 2000, ratio: 0.5 },
          { asset: 'USDC', balance: 500, price: 1, ratio: 0.5 },
        ],
      },
      isLoading: false,
    });
    render(<BreakdownModal open={true} />, { wrapper: createWrapper() });
    expect(screen.getByText('ETH')).toBeTruthy();
    expect(screen.getByText('USDC')).toBeTruthy();
  });

  it('does not render content when closed', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<BreakdownModal open={false} />, { wrapper: createWrapper() });
    expect(screen.queryByText('Portfolio breakdown')).toBeNull();
  });
});
