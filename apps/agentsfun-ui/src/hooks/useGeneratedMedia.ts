import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { useQuery } from '@tanstack/react-query';

import { mockMedia } from '../mocks';
import { GeneratedMedia } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useGeneratedMedia = () =>
  useQuery<GeneratedMedia[] | null>({
    queryKey: ['xMediaActivity'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(mockMedia), 2000));
      }

      const response = await fetch(`${LOCAL}/media`);
      if (!response.ok) throw new Error('Failed to fetch generated media');
      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    refetchInterval: FORTYFIVE_SECONDS,
  });
