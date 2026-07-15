import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { getMockSettings } from '../mocks/mockSettings';
import { ConnectSettings } from '../types';

export const useSettings = () => {
  return useQuery<ConnectSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const mock = devMock(() => delay(getMockSettings(), 2));
      if (mock !== null) return mock;

      const response = await fetch(`${LOCAL}/settings`);
      if (!response.ok) throw new Error('Failed to fetch Connect settings.');

      return response.json();
    },
    retry: Infinity,
    retryDelay: exponentialBackoffDelay,
  });
};
