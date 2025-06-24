import { useMutation } from '@tanstack/react-query';

import { LOCAL } from '../../constants/urls';
import { mockChat } from '../../mocks/mockChat';
import { ChatResponse } from '../../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

export const useChats = () =>
  useMutation<ChatResponse, Error, string>({
    mutationFn: async (prompt: string) => {
      if (IS_MOCK_ENABLED) {
        return new Promise<ChatResponse>((resolve) => {
          setTimeout(() => {
            resolve(mockChat);
          }, 2000);
        });
      }

      const response = await fetch(`${LOCAL}/configure_strategies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit prompt.');
      }

      return response.json();
    },
  });
