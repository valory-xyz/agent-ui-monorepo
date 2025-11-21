import { FIVE_MINUTES, FIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { useQuery } from '@tanstack/react-query';

import { mockFeatures } from '../mocks';
import { Features } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useFeatures = () => {
  const query = useQuery<Features>({
    queryKey: ['features'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockFeatures);
          }, 2000);
        });
      }

      const response = await fetch(`${LOCAL}/features`);
      if (!response.ok) throw new Error('Failed to fetch features');

      return response.json();
    },
    refetchInterval: (query) => (query.state.data?.isChatEnabled ? FIVE_MINUTES : FIVE_SECONDS),
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  return query;
};
