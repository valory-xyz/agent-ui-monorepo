import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TransactionMode } from '../../src/components/TransactionMode/TransactionMode';
import { ConnectSettings } from '../../src/types';

const restrictedSettings: ConnectSettings = {
  protected: { mode: 'restricted', whitelist: { gnosis: ['0xabc'] } },
  harness: 'claude_code_desktop',
};

const unrestrictedSettings: ConnectSettings = {
  ...restrictedSettings,
  protected: { ...restrictedSettings.protected, mode: 'unrestricted' },
};

const renderComponent = (settings: ConnectSettings) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionMode settings={settings} />
    </QueryClientProvider>,
  );
};

describe('TransactionMode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('renders both mode cards with the current mode selected', () => {
    renderComponent(restrictedSettings);

    expect(screen.getByText('Transaction mode')).toBeInTheDocument();
    const cards = screen.getAllByRole('radio');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute('aria-checked', 'true');
    expect(cards[1]).toHaveAttribute('aria-checked', 'false');
    expect(screen.queryByText('Unrestricted mode is on')).not.toBeInTheDocument();
  });

  it('shows the info banner when unrestricted mode is on', () => {
    renderComponent(unrestrictedSettings);

    expect(screen.getByText('Unrestricted mode is on')).toBeInTheDocument();
  });

  it('does not open the modal when clicking the already-selected mode', () => {
    renderComponent(restrictedSettings);

    fireEvent.click(screen.getByText('Restricted'));

    expect(screen.queryByText('Switch to Restricted mode?')).not.toBeInTheDocument();
    expect(screen.queryByText('Switch to Unrestricted mode?')).not.toBeInTheDocument();
  });

  it('opens the unrestricted confirmation modal and cancels it', async () => {
    renderComponent(restrictedSettings);

    fireEvent.click(screen.getByText('Unrestricted'));

    expect(await screen.findByText('Switch to Unrestricted mode?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch to Unrestricted' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(screen.queryByText('Switch to Unrestricted mode?')).not.toBeInTheDocument(),
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('opens the restricted confirmation modal from unrestricted mode', async () => {
    renderComponent(unrestrictedSettings);

    fireEvent.click(screen.getByText('Restricted'));

    expect(await screen.findByText('Switch to Restricted mode?')).toBeInTheDocument();
    expect(
      screen.getByText('Your agent will only be able to send funds to approved addresses.'),
    ).toBeInTheDocument();
  });

  it('PATCHes the protected mode with the password and closes the modal on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(unrestrictedSettings),
    });

    renderComponent(restrictedSettings);

    fireEvent.click(screen.getByText('Unrestricted'));
    await screen.findByText('Switch to Unrestricted mode?');

    fireEvent.change(screen.getByLabelText(/Enter password/), {
      target: { value: 'hunter2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Unrestricted' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/settings');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({
      protected: { mode: 'unrestricted' },
      password: 'hunter2',
    });

    await waitFor(() =>
      expect(screen.queryByText('Switch to Unrestricted mode?')).not.toBeInTheDocument(),
    );
  });

  it('shows the wrong-password error inside the modal on 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });

    renderComponent(restrictedSettings);

    fireEvent.click(screen.getByText('Unrestricted'));
    await screen.findByText('Switch to Unrestricted mode?');

    fireEvent.change(screen.getByLabelText(/Enter password/), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Unrestricted' }));

    expect(await screen.findByText('Incorrect password. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Switch to Unrestricted mode?')).toBeInTheDocument();
  });
});
