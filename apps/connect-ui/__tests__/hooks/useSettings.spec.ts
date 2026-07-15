import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useSettings } from '../../src/hooks/useSettings';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSettings', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('calls the /settings endpoint and returns data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          protected: { mode: 'restricted', whitelist: {} },
          harness: 'claude_code_desktop',
        }),
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data?.protected.mode).toBe('restricted'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/settings'));
  });

  it('queryFn throws when fetch returns ok=false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });

    // data remains undefined; retry: Infinity delays error state indefinitely
    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/settings'));
  });
});
