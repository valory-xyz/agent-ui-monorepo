import { useQuery } from '@tanstack/react-query';
import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockMemecoinActivity } from '../mock';
import { MemecoinActivity as MemecoinActivityType } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useMemecoinActivity = () =>
  useQuery<MemecoinActivityType[] | null>({
    queryKey: ['xMemecoinActivity'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(mockMemecoinActivity), 2000));
      }

      const response = await fetch(`${LOCAL}/memecoin-activity`);
      if (!response.ok) throw new Error('Failed to fetch Memecoin activity');
      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchInterval: FORTYFIVE_SECONDS,
  });
