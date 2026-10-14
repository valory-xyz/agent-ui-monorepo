import { API_V1, FIVE_MINUTES } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock, exponentialBackoffDelay } from '@agent-ui-monorepo/util-functions';
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '../constants/reactQueryKeys';
import { getMockLeaderboard } from '../mocks/mockLeaderboard';
import { AgentLeaderboardResponse, LeaderboardWindow } from '../types';

export const useLeaderboard = ({ window }: { window: LeaderboardWindow }) =>
  useQuery<AgentLeaderboardResponse>({
    queryKey: [REACT_QUERY_KEYS.LEADERBOARD, window],
    queryFn: async () => {
      const mock = devMock(() => delay(getMockLeaderboard(window)));
      if (mock !== null) return mock;

      const response = await fetch(`${API_V1}/agent/leaderboard?window=${window}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard rank');

      return response.json();
    },
    refetchInterval: FIVE_MINUTES,
    retry: 5,
    retryDelay: exponentialBackoffDelay,
  });
