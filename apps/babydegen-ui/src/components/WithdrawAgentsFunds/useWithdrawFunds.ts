import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { WithdrawalStatus, WithdrawInitiateResponse } from '../../types';
import { mockWithdrawInitiateResponse, mockWithdrawStatusResponse } from '../../mocks/mockFunds';
import { LOCAL } from '../../constants/urls';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

const initiateWithdrawal = async (targetAddress: string): Promise<WithdrawInitiateResponse> => {
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

  const { isPending, mutateAsync } = useMutation<WithdrawInitiateResponse, unknown, string>({
    mutationKey: ['withdraw-initiate'],
    mutationFn: async (targetAddress: string) => {
      const initiateResponse = await initiateWithdrawal(targetAddress);
      setWithdrawId(initiateResponse.id);
      return initiateResponse;
    },
    onError: (error) => {
      console.error('Error initiating withdrawal:', error);
      setWithdrawId(null);
    },
  });

  const { data, isLoading: isQueryLoading } = useQuery<WithdrawalStatus>({
    queryKey: ['withdraw-status', withdrawId],
    queryFn: async () => {
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
    refetchInterval: ({ state }) => (state.data?.status === 'completed' ? false : 2000),
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  return {
    withdraw: mutateAsync,
    isLoading: isPending || isQueryLoading,
    data,
  };
};
