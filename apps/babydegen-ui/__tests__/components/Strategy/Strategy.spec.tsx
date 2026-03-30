import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { Strategy } from '../../../src/components/Strategy/Strategy';

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

describe('Strategy', () => {
  it('renders loading skeleton when isLoading', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<Strategy />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-skeleton-input')).toBeInTheDocument();
  });

  it('renders n/a when no trading_type', () => {
    usePortfolio.mockReturnValue({ data: {}, isLoading: false });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getAllByText('n/a').length).toBeGreaterThan(0);
  });

  it('renders Balanced pill for balanced trading type', () => {
    usePortfolio.mockReturnValue({
      data: { trading_type: 'balanced', selected_protocols: [] },
      isLoading: false,
    });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('renders Risky pill for risky trading type', () => {
    usePortfolio.mockReturnValue({
      data: { trading_type: 'risky', selected_protocols: [] },
      isLoading: false,
    });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getByText('Risky')).toBeInTheDocument();
  });

  it('renders "No protocols" when selected_protocols is empty', () => {
    usePortfolio.mockReturnValue({
      data: { trading_type: 'balanced', selected_protocols: [] },
      isLoading: false,
    });
    render(<Strategy />, { wrapper: createWrapper() });
    expect(screen.getByText('No protocols')).toBeInTheDocument();
  });
});
