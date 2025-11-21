// eslint-disable-next-line @nx/enforce-module-boundaries
import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { useMutation } from '@tanstack/react-query';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useChats = <T>(mockChat: T) =>
  useMutation<T, Error, string>({
    mutationFn: async (prompt: string) => {
      if (IS_MOCK_ENABLED) {
        return new Promise<T>((resolve) => {
          setTimeout(() => {
            resolve(mockChat);
          }, 2000);
        });
      }

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

      return response.json();
    },
  });
