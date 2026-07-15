import { LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { delay, devMock } from '@agent-ui-monorepo/util-functions';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyMockSettingsPatch } from '../mocks/mockSettings';
import { ConnectSettings, SettingsPatch } from '../types';

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<ConnectSettings, Error, SettingsPatch>({
    mutationKey: ['updateSettings'],
    mutationFn: async (patch) => {
      const mock = devMock(() => delay(applyMockSettingsPatch(patch), 1));
      if (mock !== null) return mock;

      const response = await fetch(`${LOCAL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      if (response.status === 401) throw new Error('Incorrect password. Please try again.');
      if (response.status === 429)
        throw new Error('Too many failed attempts. Please try again later.');
      if (!response.ok) throw new Error('Failed to update settings.');

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
