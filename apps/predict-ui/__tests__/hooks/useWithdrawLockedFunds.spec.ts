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

const mockInitiateResponse = { id: 'wd-1', status: 'initiated' };
const mockStatusResponse = {
  status: 'withdrawing',
  message: 'Selling open positions...',
  transaction_link: null,
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

  it('exposes initiateWithdraw and starts in a non-loading state', () => {
    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });
    expect(typeof result.current.initiateWithdraw).toBe('function');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('POSTs to /withdrawal/initiate with no body when initiateWithdraw is called', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockInitiateResponse) })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockStatusResponse) });

    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateWithdraw();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/withdrawal/initiate'),
      expect.objectContaining({ method: 'POST' }),
    );
    const initiateCall = (global.fetch as jest.Mock).mock.calls.find(([url]) =>
      String(url).includes('/withdrawal/initiate'),
    );
    expect(initiateCall?.[1]?.body).toBeUndefined();
  });

  it('hits the status endpoint with the id returned from initiate', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockInitiateResponse) })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockStatusResponse) });

    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateWithdraw();
    });

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/withdrawal/status/wd-1')),
    );
  });

  it('keeps data undefined while the status query retries on a non-ok response', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockInitiateResponse) })
      .mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.initiateWithdraw();
    });

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/withdrawal/status/')),
    );
    expect(result.current.data).toBeUndefined();
  });

  it('returns isError=true when the initiate POST fails', async () => {
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
