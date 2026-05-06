import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useWithdrawLockedFunds } from '../../src/hooks/useWithdrawLockedFunds';
import {
  mockWithdrawInitiateResponse,
  mockWithdrawStatusResponse,
} from '../../src/mocks/mockWithdrawal';

jest.mock('@agent-ui-monorepo/util-functions', () => ({
  ...jest.requireActual('@agent-ui-monorepo/util-functions'),
  devMock: <T>(fn: () => T) => fn(),
  delay: <T>(value: T) => Promise.resolve(value),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useWithdrawLockedFunds — dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock initiate and status without calling fetch', async () => {
    const { result } = renderHook(() => useWithdrawLockedFunds(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.initiateWithdraw();
    });

    await waitFor(() => expect(result.current.data).toEqual(mockWithdrawStatusResponse));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockWithdrawInitiateResponse.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});
