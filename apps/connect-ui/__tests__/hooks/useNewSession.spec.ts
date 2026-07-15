import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useNewSession } from '../../src/hooks/useNewSession';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNewSession', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('POSTs to /session and returns the launch result', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ launched: true, harness: 'claude_code_desktop' }),
    });

    const { result } = renderHook(() => useNewSession(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.data?.launched).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/session'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('surfaces the server-reported error when launched is false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          launched: false,
          harness: 'claude_code_cli',
          error: 'claude-cli deep link was not handled',
        }),
    });

    const { result } = renderHook(() => useNewSession(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() =>
      expect(result.current.error?.message).toBe('claude-cli deep link was not handled'),
    );
  });

  it('falls back to a generic message when launched is false without an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ launched: false, harness: 'claude_code_cli' }),
    });

    const { result } = renderHook(() => useNewSession(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() =>
      expect(result.current.error?.message).toBe('Failed to start a new Connect session.'),
    );
  });

  it('surfaces a not-ready message on 503', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useNewSession(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() =>
      expect(result.current.error?.message).toBe(
        'The agent is still starting up. Please try again shortly.',
      ),
    );
  });

  it('surfaces a generic error on other failures', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useNewSession(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() =>
      expect(result.current.error?.message).toBe('Failed to start a new Connect session.'),
    );
  });
});
