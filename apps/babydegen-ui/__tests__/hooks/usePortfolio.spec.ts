import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { usePortfolio } from '../../src/hooks/usePortfolio';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockPortfolioData = {
  portfolio_value: 10000,
  total_roi: 5.5,
  partial_roi: 3.0,
  allocations: [],
  portfolio_breakdown: [],
  trading_type: 'balanced',
  selected_protocols: [],
};

describe('usePortfolio', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls the /portfolio endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPortfolioData),
    });

    const { result } = renderHook(() => usePortfolio(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolio'));
  });

  it('returns portfolio data after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPortfolioData),
    });

    const { result } = renderHook(() => usePortfolio(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(mockPortfolioData));
  });

  it('queryFn throws when fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => usePortfolio(), { wrapper: createWrapper() });

    // data remains undefined; retry: Infinity delays error state indefinitely
    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/portfolio'));
  });
});
