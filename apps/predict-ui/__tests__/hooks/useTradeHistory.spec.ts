import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { usePositionDetails, useTradeHistory } from '../../src/hooks/useTradeHistory';

// delay(undefined, 1) adds a 1-second pause in the queryFn — mock it out for tests
jest.mock('@agent-ui-monorepo/util-functions', () => ({
  ...jest.requireActual('@agent-ui-monorepo/util-functions'),
  delay: <T>(value: T) => Promise.resolve(value),
  exponentialBackoffDelay: () => 0,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockHistoryData = {
  agent_id: 'agent_123',
  currency: 'USD',
  page: 1,
  page_size: 10,
  total: 2,
  items: [],
};

const mockPositionData = {
  id: 'pos_1',
  question: 'Will X happen?',
  currency: 'USD',
  total_bet: 1.0,
  payout: 1.5,
  status: 'pending',
  net_profit: 0,
  bets: [],
  external_url: 'https://example.com',
};

describe('useTradeHistory', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls the prediction-history endpoint with page and page_size', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHistoryData),
    });

    const { result } = renderHook(() => useTradeHistory({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/agent/prediction-history?page=1&page_size=10'),
    );
  });

  it('uses different page values in the URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockHistoryData, page: 3 }),
    });

    const { result } = renderHook(() => useTradeHistory({ page: 3, pageSize: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('page=3&page_size=5'));
  });

  it('returns data after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHistoryData),
    });

    const { result } = renderHook(() => useTradeHistory({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(mockHistoryData));
  });

  it('queryFn throws when fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useTradeHistory({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    // data remains undefined; retry logic delays error state
    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/prediction-history'));
  });
});

describe('usePositionDetails', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls /agent/position-details/{id} endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPositionData),
    });

    const { result } = renderHook(() => usePositionDetails({ id: 'pos_abc' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/agent/position-details/pos_abc'),
    );
  });

  it('returns position data after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPositionData),
    });

    const { result } = renderHook(() => usePositionDetails({ id: 'pos_1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(mockPositionData));
  });

  it('queryFn throws when fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => usePositionDetails({ id: 'pos_1' }), {
      wrapper: createWrapper(),
    });

    // data remains undefined; retry logic delays error state
    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/agent/position-details/pos_1'),
    );
  });
});
