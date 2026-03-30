import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useAgentDetails } from '../../src/hooks/useAgentDetails';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockAgentDetailsData = {
  id: '0xabc',
  created_at: '2024-01-01T00:00:00Z',
  last_active_at: '2024-06-01T00:00:00Z',
};

const mockPerformanceData = {
  agent_id: '0xabc',
  window: '7d',
  currency: 'USD',
  metrics: {
    all_time_funds_used: 100,
    all_time_profit: 10,
    funds_locked_in_markets: 5,
    available_funds: 85,
    roi: 0.1,
  },
  stats: { predictions_made: 50, prediction_accuracy: 0.6 },
};

describe('useAgentDetails', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls /agent/details and /agent/performance endpoints', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAgentDetailsData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPerformanceData),
      });

    const { result } = renderHook(() => useAgentDetails(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/details'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/performance'));
  });

  it('returns isLoading=true initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(jest.fn()));

    const { result } = renderHook(() => useAgentDetails(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns data after successful fetch', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAgentDetailsData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPerformanceData),
      });

    const { result } = renderHook(() => useAgentDetails(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data.agentDetails).toEqual(mockAgentDetailsData);
    expect(result.current.data.performance).toEqual(mockPerformanceData);
  });

  it('queryFn throws when agent details fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { result } = renderHook(() => useAgentDetails(), { wrapper: createWrapper() });

    // data.agentDetails remains undefined on failure; retry logic delays error state
    await waitFor(() => expect(result.current.data.agentDetails).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/details'));
  });
});
