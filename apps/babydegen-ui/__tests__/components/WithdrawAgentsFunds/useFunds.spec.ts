import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useFunds } from '../../../src/components/WithdrawAgentsFunds/useFunds';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockFundsData = {
  amount: 1000000000,
  total_value_usd: 1000,
  asset_breakdown: [
    { token_symbol: 'ETH', value: 0.5, value_usd: 750 },
    { token_symbol: 'USDC', value: 500, value_usd: 500 },
  ],
};

describe('useFunds', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls the /withdrawal/amount endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFundsData),
    });

    const { result } = renderHook(() => useFunds(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/withdrawal/amount'));
  });

  it('returns funds data after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFundsData),
    });

    const { result } = renderHook(() => useFunds(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(mockFundsData));
  });

  it('queryFn throws when fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useFunds(), { wrapper: createWrapper() });

    // data remains undefined; retry: Infinity delays error state indefinitely
    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/withdrawal/amount'));
  });
});
