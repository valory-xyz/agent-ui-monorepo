import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';

import { useChats } from './useChats';

// IS_MOCK_ENABLED is a module-level constant read at import time.
// It defaults to false (process.env.IS_MOCK_ENABLED !== 'true'), so a plain
// static import gives us the non-mock path without any resetModules dance.
// Testing IS_MOCK_ENABLED='true' requires a dedicated spec file with the env
// var set in setupFilesAfterEnv. See CLAUDE.md for the full decision tree.

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockResponse = { result: 'success' };

describe('useChats', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('returns isPending and mutateAsync on mount', () => {
    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });
    expect(result.current.isPending).toBe(false);
    expect(typeof result.current.mutateAsync).toBe('function');
  });

  it('calls the correct endpoint with the prompt', async () => {
    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('test prompt');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/configure_strategies'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test prompt' }),
      }),
    );
  });

  it('resolves with the parsed JSON response on success', async () => {
    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });

    let resolved: unknown;
    await act(async () => {
      resolved = await result.current.mutateAsync('hello');
    });

    expect(resolved).toEqual(mockResponse);
  });

  it('throws with data.error message when response is not ok and has error field', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Custom server error' }),
    } as Response);

    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('hello');
      }),
    ).rejects.toThrow('Custom server error');
  });

  it('throws the default message when response is not ok and has no error field', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);

    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('hello');
      }),
    ).rejects.toThrow('Failed to send chat, please try again.');
  });

  it('throws the default message when response body is invalid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new SyntaxError('invalid json')),
    } as Response);

    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('hello');
      }),
    ).rejects.toThrow('Failed to send chat, please try again.');
  });

  it('throws when fetch fails at the network level', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('hello');
      }),
    ).rejects.toThrow('Failed to fetch');
  });

  it('calls fetch when IS_MOCK_ENABLED is false (non-mock path runs)', async () => {
    const { result } = renderHook(() => useChats(mockResponse), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await result.current.mutateAsync('ping');
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
