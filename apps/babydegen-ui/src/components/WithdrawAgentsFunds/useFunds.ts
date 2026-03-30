import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { devMock } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { mockFunds } from '../../mocks/mockFundsWithdrawal';
import { WithdrawalFunds } from '../../types';

export const useFunds = () =>
  useQuery<WithdrawalFunds>({
    queryKey: ['withdrawalFunds'],
    queryFn: async () => {
      const mock = devMock(
        () => new Promise<WithdrawalFunds>((resolve) => setTimeout(() => resolve(mockFunds), 2000)),
      );
      if (mock !== null) return mock;

      const response = await fetch(`${LOCAL}/withdrawal/amount`);
      if (!response.ok) throw new Error('Failed to fetch withdrawal amount.');

      return response.json();
    },
    refetchInterval: (query) => (query.state.data ? 5000 : 1000),
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });
