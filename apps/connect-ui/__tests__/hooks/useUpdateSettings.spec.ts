import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useUpdateSettings } from '../../src/hooks/useUpdateSettings';
import { SettingsPatch } from '../../src/types';

const modePatch: SettingsPatch = {
  protected: { mode: 'unrestricted' },
  password: 'hunter2',
};

const createClientAndWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
};

describe('useUpdateSettings', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('PATCHes the merge-patch to /settings and invalidates the settings query', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ protected: { mode: 'unrestricted', whitelist: {} } }),
    });

    const { queryClient, wrapper } = createClientAndWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateSettings(), { wrapper });

    result.current.mutate(modePatch);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/settings'),
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify(modePatch) }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings'] });
    expect(result.current.data?.protected.mode).toBe('unrestricted');
  });

  it('surfaces a wrong-password error on 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });

    const { wrapper } = createClientAndWrapper();
    const { result } = renderHook(() => useUpdateSettings(), { wrapper });

    result.current.mutate(modePatch);

    await waitFor(() =>
      expect(result.current.error?.message).toBe('Incorrect password. Please try again.'),
    );
  });

  it('surfaces a rate-limit error on 429', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({}),
    });

    const { wrapper } = createClientAndWrapper();
    const { result } = renderHook(() => useUpdateSettings(), { wrapper });

    result.current.mutate(modePatch);

    await waitFor(() =>
      expect(result.current.error?.message).toBe(
        'Too many failed attempts. Please try again later.',
      ),
    );
  });

  it('surfaces a generic error on other failures', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({}),
    });

    const { wrapper } = createClientAndWrapper();
    const { result } = renderHook(() => useUpdateSettings(), { wrapper });

    result.current.mutate({ harness: 'claude_code_cli' });

    await waitFor(() => expect(result.current.error?.message).toBe('Failed to update settings.'));
  });
});
