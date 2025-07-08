import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Address } from '@agent-ui-monorepo/util-constants-and-types';

import { WithdrawalStatus, WithdrawInitiateResponse } from '../../types';
import {
  mockWithdrawInitiateResponse,
  mockWithdrawStatusResponse,
} from '../../mocks/mockFundsWithdrawal';
import { LOCAL } from '../../constants/urls';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

const initiateWithdrawal = async (targetAddress: Address): Promise<WithdrawInitiateResponse> => {
  if (IS_MOCK_ENABLED) {
    return new Promise<WithdrawInitiateResponse>((resolve) => {
      setTimeout(() => {
        resolve(mockWithdrawInitiateResponse);
      }, 2000);
    });
  }

  const response = await fetch(`${LOCAL}/withdrawal/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_address: targetAddress }),
  });

  if (!response.ok) throw new Error('Failed to initiate withdrawal.');

  return response.json();
};

export const useWithdrawFunds = () => {
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const { isPending, isError, mutateAsync } = useMutation<
    WithdrawInitiateResponse,
    unknown,
    Address
  >({
    mutationKey: ['withdraw-initiate'],
    mutationFn: async (targetAddress: Address) => {
      const initiateResponse = await initiateWithdrawal(targetAddress);
      setWithdrawId(initiateResponse.id);
      return initiateResponse;
    },
    onError: (error) => {
      console.error('Error initiating withdrawal:', error);
      setWithdrawId(null);
    },
  });

  const {
    data,
    isLoading: isQueryLoading,
    isError: isQueryError,
  } = useQuery<WithdrawalStatus>({
    queryKey: ['withdraw-status', withdrawId],
    queryFn: async () => {
      if (!withdrawId) {
        throw new Error('Withdrawal ID is required to fetch status.');
      }

      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockWithdrawStatusResponse);
          }, 2000);
        });
      }

      const response = await fetch(`${LOCAL}/withdrawal/status/${withdrawId}`);
      if (!response.ok) throw new Error('Failed to fetch withdrawal status.');

      return response.json();
    },
    enabled: !!withdrawId,
    refetchInterval: ({ state }) => (state.data?.status === 'completed' ? false : 2000),
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  return {
    isLoading: isPending || isQueryLoading,
    isError: isError || isQueryError,
    data,
    initiateWithdraw: mutateAsync,
  };
};
