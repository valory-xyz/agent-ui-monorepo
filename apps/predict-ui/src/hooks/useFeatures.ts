import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { FIVE_MINUTES, FIVE_SECONDS } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { mockFeatures } from '../mocks/mockFeatures';
import { Features } from '../types';

export const useFeatures = () => {
  const query = useQuery<Features>({
    queryKey: ['features'],
    queryFn: async () => {
      const mock = devMock(() => delay(mockFeatures, 2000));
      if (mock !== null) return mock;

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
