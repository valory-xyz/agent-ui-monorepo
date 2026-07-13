import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock } from '@agent-ui-monorepo/util-functions';
import { useMutation } from '@tanstack/react-query';

import { mockSessionResponse } from '../mocks/mockSettings';
import { SessionResponse } from '../types';

export const useNewSession = () => {
  return useMutation<SessionResponse, Error, void>({
    mutationKey: ['newSession'],
    mutationFn: async () => {
      const mock = devMock(() => delay(mockSessionResponse, 1));
      if (mock !== null) return mock;

      const response = await fetch(`${LOCAL}/session`, { method: 'POST' });

      if (response.status === 503)
        throw new Error('The agent is still starting up. Please try again shortly.');
      if (!response.ok) throw new Error('Failed to start a new Connect session.');

      // A deep link that won't open is the operator's environment, not a
      // server fault — the server answers 200 with launched: false + error.
      const session: SessionResponse = await response.json();
      if (!session.launched) {
        throw new Error(session.error ?? 'Failed to start a new Connect session.');
      }

      return session;
    },
  });
};
