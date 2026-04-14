import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock } from '@agent-ui-monorepo/util-functions';
import { useMutation } from '@tanstack/react-query';

export const useChats = <T>(mockChat: T) =>
  useMutation<T, Error, string>({
    mutationFn: async (prompt: string) => {
      const mock = devMock(() => delay(mockChat, 2));
      if (mock !== null) return mock;

      const response = await fetch(`${LOCAL}/configure_strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send chat, please try again.';
        try {
          const data = await response.json();
          if (data?.error) {
            errorMessage = data.error;
          }
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      try {
        return await response.json();
      } catch {
        throw new Error('Failed to send chat, please try again.');
      }
    },
  });
