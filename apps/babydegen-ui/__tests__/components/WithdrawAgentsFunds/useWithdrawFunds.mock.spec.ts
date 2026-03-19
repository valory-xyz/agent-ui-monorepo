import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useWithdrawFunds } from '../../../src/components/WithdrawAgentsFunds/useWithdrawFunds';
import {
  mockWithdrawInitiateResponse,
  mockWithdrawStatusResponse,
} from '../../../src/mocks/mockFundsWithdrawal';

jest.mock('@agent-ui-monorepo/util-functions', () => ({
  ...jest.requireActual('@agent-ui-monorepo/util-functions'),
  devMock: <T>(fn: () => T) => fn(),
  delay: <T>(value: T) => Promise.resolve(value),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useWithdrawFunds – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('initiateWithdraw returns mock initiate response without calling fetch', async () => {
    const { result } = renderHook(() => useWithdrawFunds(), { wrapper: createWrapper() });

    let initiateResult: unknown;
    await act(async () => {
      initiateResult = await result.current.initiateWithdraw(
        '0x9876543210987654321098765432109876543210',
      );
    });

    expect(initiateResult).toEqual(mockWithdrawInitiateResponse);
    expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/withdrawal/initiate'));
  });

  it('status query resolves to mock status response after initiateWithdraw', async () => {
    const { result } = renderHook(() => useWithdrawFunds(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.initiateWithdraw('0x9876543210987654321098765432109876543210');
    });

    await waitFor(() => expect(result.current.data).toEqual(mockWithdrawStatusResponse));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
