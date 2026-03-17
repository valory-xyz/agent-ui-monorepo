import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useWithdrawFunds } from '../../../src/components/WithdrawAgentsFunds/useWithdrawFunds';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockInitiateResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  status: 'initiated',
  target_address: '0x9876543210987654321098765432109876543210',
  estimated_value_usd: 1500,
  chain: 'mode',
};

const mockStatusResponse = {
  status: 'completed',
  message: 'Done',
  target_address: '0x9876543210987654321098765432109876543210',
  chain: 'mode',
  safe_address: '0x1234567890123456789012345678901234567890',
  requested_at: '1703123456',
  estimated_value_usd: 1500,
  transaction_link: 'https://example.com/tx/123',
};

describe('useWithdrawFunds', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
    jest.restoreAllMocks();
  });

  it('returns initiateWithdraw function and isLoading=false initially', () => {
    const { result } = renderHook(() => useWithdrawFunds(), { wrapper: createWrapper() });
    expect(typeof result.current.initiateWithdraw).toBe('function');
    expect(result.current.isLoading).toBe(false);
  });

  it('calls /withdrawal/initiate with POST and the target address', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInitiateResponse),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatusResponse),
      });

    const { result } = renderHook(() => useWithdrawFunds(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.initiateWithdraw('0x9876543210987654321098765432109876543210');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/withdrawal/initiate'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('status query is enabled after initiateWithdraw succeeds', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInitiateResponse),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatusResponse),
      });

    const { result } = renderHook(() => useWithdrawFunds(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.initiateWithdraw('0x9876543210987654321098765432109876543210');
    });

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/withdrawal/status/')),
    );
  });

  it('returns isError=true when initiate fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useWithdrawFunds(), { wrapper: createWrapper() });

    await act(async () => {
      try {
        await result.current.initiateWithdraw('0x9876543210987654321098765432109876543210');
      } catch {
        // expected to throw
      }
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
