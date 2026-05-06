import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useWithdrawLockedFunds } from '../../src/hooks/useWithdrawLockedFunds';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockSellingStatus = {
  mode: 'selling',
  venue: 'polymarket',
  positions_total: 7,
  positions_sold: 4,
  positions_stuck: 0,
  fills: [],
  errors: [],
};

describe('useWithdrawLockedFunds', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
    jest.restoreAllMocks();
  });

  it('does NOT call the withdrawal API on mount — only after the user initiates', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSellingStatus),
    });

    renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('exposes initiateWithdraw and starts with no data', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSellingStatus),
    });
    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });
    expect(typeof result.current.initiateWithdraw).toBe('function');
    expect(result.current.data).toBeUndefined();
  });

  it('POSTs to /api/v1/withdrawal with no body when initiateWithdraw is called', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSellingStatus),
    });

    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateWithdraw();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/withdrawal'),
      expect.objectContaining({ method: 'POST' }),
    );
    const postCall = (global.fetch as jest.Mock).mock.calls.find(
      ([, init]) => init?.method === 'POST',
    );
    expect(postCall?.[1]?.body).toBeUndefined();
  });

  it('pushes the POST response into the query cache so the UI updates immediately', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSellingStatus),
    });

    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.initiateWithdraw();
    });

    await waitFor(() => expect(result.current.data?.mode).toBe('selling'));
    expect(result.current.data?.positions_total).toBe(7);
  });

  it('returns isError=true when the POST fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });
    await act(async () => {
      try {
        await result.current.initiateWithdraw();
      } catch {
        // expected
      }
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    consoleErrorSpy.mockRestore();
  });
});
