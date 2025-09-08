import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { useQuery } from '@tanstack/react-query';

import { mockXActivity } from '../mock';
import { XActivity as XActivityType } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useXActivity = () =>
  useQuery<XActivityType | null>({
    queryKey: ['xActivity'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(mockXActivity), 2000));
      }

      const response = await fetch(`${LOCAL}/x-activity`);
      if (!response.ok) throw new Error('Failed to fetch X activity');
      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchInterval: FORTYFIVE_SECONDS,
  });
