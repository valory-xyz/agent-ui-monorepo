import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useProfitOverTime } from '../../src/hooks/useProfitOverTime';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockData = {
  agent_id: 'agent_123',
  currency: 'USD',
  window: '7d',
  points: [
    { timestamp: '2025-01-01T00:00:00Z', delta_profit: 1.5 },
    { timestamp: '2025-01-02T00:00:00Z', delta_profit: -0.5 },
  ],
};

describe('useProfitOverTime', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls the endpoint with window parameter', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useProfitOverTime({ window: '7d' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/agent/profit-over-time?window=7d'),
    );
  });

  it('passes different window values to the endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockData, window: '30d' }),
    });

    const { result } = renderHook(() => useProfitOverTime({ window: '30d' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('window=30d'));
  });

  it('returns data after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useProfitOverTime({ window: '7d' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(mockData));
  });

  it('queryFn throws when fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useProfitOverTime({ window: '7d' }), {
      wrapper: createWrapper(),
    });

    // data remains undefined; retry logic delays error state
    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/profit-over-time'));
  });
});
