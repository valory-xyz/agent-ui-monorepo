import { API_V1 } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { mockWithdrawalStatus } from '../mocks/mockWithdrawal';
import { WithdrawalMode, WithdrawalStatus } from '../types';

const POLL_INTERVAL_MS = 2000;

const isPollingMode = (mode: WithdrawalMode | undefined) => mode === 'armed' || mode === 'selling';

const fetchWithdrawalStatus = async (): Promise<WithdrawalStatus> => {
  const mock = devMock(() => delay(mockWithdrawalStatus));
  if (mock !== null) return mock;

  const response = await fetch(`${API_V1}/withdrawal`);
  if (!response.ok) throw new Error('Failed to fetch withdrawal status.');
  return response.json();
};

const armWithdrawal = async (): Promise<WithdrawalStatus> => {
  const mock = devMock(() => delay(mockWithdrawalStatus));
  if (mock !== null) return mock;

  const response = await fetch(`${API_V1}/withdrawal`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to arm withdrawal.');
  return response.json();
};

export const useWithdrawLockedFunds = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery<WithdrawalStatus>({
    queryKey: [REACT_QUERY_KEYS.WITHDRAW_STATUS],
    queryFn: fetchWithdrawalStatus,
    refetchInterval: ({ state }) => (isPollingMode(state.data?.mode) ? POLL_INTERVAL_MS : false),
    // Infinite retries keep transient network failures from surfacing as a hard error
    // — the status query has no terminal "errored" state from the UI's perspective.
    retry: Infinity,
    retryDelay: exponentialBackoffDelay,
  });

  const {
    isPending: isArming,
    isError: isArmError,
    mutateAsync,
    reset: resetMutation,
  } = useMutation<WithdrawalStatus>({
    mutationKey: [REACT_QUERY_KEYS.WITHDRAW_INITIATE],
    mutationFn: async () => {
      const response = await armWithdrawal();
      // POST returns the full status — push it into the query cache so the UI
      // reflects the new mode immediately without waiting for the next poll tick.
      queryClient.setQueryData<WithdrawalStatus>([REACT_QUERY_KEYS.WITHDRAW_STATUS], response);
      return response;
    },
    onError: (error) => {
      console.error('Error arming withdrawal:', error);
    },
  });

  const initiateWithdraw = async () => {
    resetMutation();
    await mutateAsync();
  };

  return {
    // POST-mutation only — drives the initiate button's loading state.
    // The status GET is intentionally not surfaced here so the button doesn't
    // flash "loading" while the initial status fetch is in flight.
    isLoading: isArming,
    isError: isArmError,
    data,
    initiateWithdraw,
  };
};
