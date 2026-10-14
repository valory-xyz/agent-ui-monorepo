import { API_V1 } from '@agent-ui-monorepo/util-constants-and-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { REACT_QUERY_KEYS } from '../../src/constants/reactQueryKeys';
import { useLeaderboard } from '../../src/hooks/useLeaderboard';
import { LeaderboardWindow } from '../../src/types';

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const newClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const mockData = {
  agent_id: '0xabc',
  agent_type: 'omenstrat',
  window: '7d',
  status: 'ranked',
  rank_by_roi: 114,
  rank_by_pnl: 124,
  total_ranked: 242,
  not_ranked_reason: null,
  leaderboard_url: 'https://predict.olas.network/leaderboard?window=7d&pin=0xabc',
  last_updated: '2026-10-08T12:00:00Z',
};

describe('useLeaderboard', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it.each<LeaderboardWindow>(['7d', '30d', '90d', '1y'])(
    'calls /agent/leaderboard with window=%s',
    async (window) => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...mockData, window }),
      });

      const { result } = renderHook(() => useLeaderboard({ window }), {
        wrapper: createWrapper(newClient()),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(global.fetch).toHaveBeenCalledWith(`${API_V1}/agent/leaderboard?window=${window}`);
    },
  );

  it('keys the query by window', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockData, window: '1y' }),
    });
    const queryClient = newClient();

    const { result } = renderHook(() => useLeaderboard({ window: '1y' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data).toEqual({ ...mockData, window: '1y' }));
    expect(queryClient.getQueryData([REACT_QUERY_KEYS.LEADERBOARD, '1y'])).toEqual({
      ...mockData,
      window: '1y',
    });
  });

  it('errors when the response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch leaderboard rank' }),
    });
    const { result } = renderHook(() => useLeaderboard({ window: '7d' }), {
      wrapper: createWrapper(newClient()),
    });

    // The hook sets its own retry count, so only check that no data arrives.
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(result.current.data).toBeUndefined();
  });
});
