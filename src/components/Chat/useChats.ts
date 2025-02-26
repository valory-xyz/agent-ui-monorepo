import { useMutation } from '@tanstack/react-query';

export type ChatResponse = {
  reasoning: string;
  trading_type: 'risky' | 'balanced';
  selected_protocols: ('balancerPool' | 'sturdy')[];
};

const IS_MOCK_ENABLED = true;

export const useChats = () =>
  useMutation<ChatResponse, Error, string>({
    mutationFn: async (prompt: string) => {
      // TODO: Remove dummy
      if (IS_MOCK_ENABLED) {
        // return new Promise<ChatResponse>((_resolve, reject) => {
        //   setTimeout(() => {
        //     reject('Failed to submit prompt.');
        //   }, 2000);
        // });

        return new Promise<ChatResponse>((resolve) => {
          setTimeout(() => {
            resolve({
              reasoning: `Mocked response for prompt: ${prompt}`,
              trading_type: 'balanced',
              selected_protocols: ['balancerPool'],
            });
          }, 2000);
        });
        return;
      }

      const response = await fetch(
        'http://127.0.0.1:8716/configure_strategies',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to submit prompt.');
      }

      return response.json() as Promise<ChatResponse>;
    },
  });
