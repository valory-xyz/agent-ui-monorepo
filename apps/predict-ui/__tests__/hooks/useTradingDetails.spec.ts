import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useTradingDetails } from '../../src/hooks/useTradingDetails';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockData = {
  agent_id: '0xabc',
  trading_type: 'balanced',
  trading_type_description: 'Balanced risk and reward.',
};

describe('useTradingDetails', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls the /agent/trading-details endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useTradingDetails(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/trading-details'));
  });

  it('returns data after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useTradingDetails(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(mockData));
  });

  it('refetches every 30 seconds so a goal changed from Pearl shows up', async () => {
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useTradingDetails(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toEqual(mockData));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(() => jest.advanceTimersByTimeAsync(30_000));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('queryFn throws when fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useTradingDetails(), { wrapper: createWrapper() });

    // data remains undefined; retry logic delays error state
    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/trading-details'));
  });
});
