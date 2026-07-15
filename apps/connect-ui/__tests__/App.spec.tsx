import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import App from '../src/App';
import { ConnectSettings } from '../src/types';

const restrictedSettings: ConnectSettings = {
  protected: {
    mode: 'restricted',
    whitelist: { gnosis: ['0x735faab1c4ec41128c367afb5c3bac73509f70bb'] },
  },
  harness: 'claude_code_desktop',
};

const unrestrictedSettings: ConnectSettings = {
  ...restrictedSettings,
  protected: { ...restrictedSettings.protected, mode: 'unrestricted' },
};

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

describe('App', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('shows a spinner while settings are loading', () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => undefined));

    const { container } = renderApp();

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders all sections including the whitelist in restricted mode', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(restrictedSettings),
    });

    renderApp();

    await waitFor(() => expect(screen.getByText('Get started with Connect')).toBeInTheDocument());
    expect(screen.getByText('Coding tool')).toBeInTheDocument();
    expect(screen.getByText('Transaction mode')).toBeInTheDocument();
    expect(screen.getByText('Whitelisted addresses')).toBeInTheDocument();
    expect(screen.getByText('0x735f...70bb')).toBeInTheDocument();
    expect(screen.queryByText('Unrestricted mode is on')).not.toBeInTheDocument();
  });

  it('hides the whitelist and shows the banner in unrestricted mode', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(unrestrictedSettings),
    });

    renderApp();

    await waitFor(() => expect(screen.getByText('Unrestricted mode is on')).toBeInTheDocument());
    expect(screen.queryByText('Whitelisted addresses')).not.toBeInTheDocument();
  });
});
