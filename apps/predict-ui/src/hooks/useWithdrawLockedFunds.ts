import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockWithdrawInitiateResponse, mockWithdrawStatusResponse } from '../mocks/mockWithdrawal';
import { WithdrawalInitiateResponse, WithdrawalStatus } from '../types';

const POLL_INTERVAL_MS = 2000;

const isTerminalStatus = (status: WithdrawalStatus['status'] | undefined) =>
  status === 'completed' || status === 'failed';

const initiateWithdrawal = async (): Promise<WithdrawalInitiateResponse> => {
  const mock = devMock(() => delay(mockWithdrawInitiateResponse));
  if (mock !== null) return mock;

  const response = await fetch(`${LOCAL}/withdrawal/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to initiate withdrawal.');
  return response.json();
};

const fetchWithdrawalStatus = async (id: string): Promise<WithdrawalStatus> => {
  const mock = devMock(() => delay(mockWithdrawStatusResponse));
  if (mock !== null) return mock;

  const response = await fetch(`${LOCAL}/withdrawal/status/${id}`);
  if (!response.ok) throw new Error('Failed to fetch withdrawal status.');
  return response.json();
};

export const useWithdrawLockedFunds = () => {
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const {
    isPending: isInitiating,
    isError: isInitiateError,
    mutateAsync,
    reset: resetMutation,
  } = useMutation<WithdrawalInitiateResponse>({
    mutationKey: [REACT_QUERY_KEYS.WITHDRAW_INITIATE],
    mutationFn: async () => {
      const response = await initiateWithdrawal();
      setWithdrawId(response.id);
      return response;
    },
    onError: (error) => {
      console.error('Error initiating withdrawal:', error);
      setWithdrawId(null);
    },
  });

  const { data, isLoading: isStatusLoading } = useQuery<WithdrawalStatus>({
    queryKey: [REACT_QUERY_KEYS.WITHDRAW_STATUS, withdrawId],
    queryFn: () => fetchWithdrawalStatus(withdrawId as string),
    enabled: !!withdrawId,
    refetchInterval: ({ state }) =>
      isTerminalStatus(state.data?.status) ? false : POLL_INTERVAL_MS,
    // Infinite retries keep transient network failures from surfacing as a hard error
    // — the status query has no terminal "errored" state from the UI's perspective.
    retry: Infinity,
    retryDelay: exponentialBackoffDelay,
  });

  const initiateWithdraw = async () => {
    resetMutation();
    await mutateAsync();
  };

  return {
    isLoading: isInitiating || isStatusLoading,
    isError: isInitiateError,
    data,
    initiateWithdraw,
  };
};
