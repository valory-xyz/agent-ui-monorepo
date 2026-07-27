import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import App from '../src/App';
import { ConnectSettings } from '../src/types';

const settings: ConnectSettings = {
  protected: {
    mode: 'restricted',
    whitelist: { gnosis: ['0x735faab1c4ec41128c367afb5c3bac73509f70bb'] },
  },
  harness: 'claude_code_desktop',
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

  it('renders all sections once settings load', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(settings),
    });

    renderApp();

    await waitFor(() => expect(screen.getByText('Get started with Connect')).toBeInTheDocument());
    expect(screen.getByText('Coding tool')).toBeInTheDocument();
    expect(screen.getByText('Whitelisted addresses')).toBeInTheDocument();
    // Whitelist entries are deliberately not listed.
    expect(screen.queryByText('0x735f...70bb')).not.toBeInTheDocument();
    // The Restricted/Unrestricted mode section was removed from the agent UI.
    expect(screen.queryByText('Transaction mode')).not.toBeInTheDocument();
  });
});
