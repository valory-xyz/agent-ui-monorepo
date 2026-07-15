import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GetStarted } from '../../src/components/GetStarted/GetStarted';

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <GetStarted />
    </QueryClientProvider>,
  );
};

describe('GetStarted', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('renders the section copy and button', () => {
    renderComponent();

    expect(screen.getByText('Get started with Connect')).toBeInTheDocument();
    expect(
      screen.getByText('Work with your Connect agent from your coding tool.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Connect Session/ })).toBeInTheDocument();
  });

  it('POSTs to /session on click and shows no error on a successful launch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ launched: true, harness: 'claude_code_desktop' }),
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /New Connect Session/ }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/session'),
        expect.objectContaining({ method: 'POST' }),
      ),
    );
    expect(document.querySelector('.ant-alert')).not.toBeInTheDocument();
  });

  it('shows the server-reported launch error as a dismissable alert', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          launched: false,
          harness: 'claude_code_desktop',
          error: 'Claude Desktop did not handle the deep link.',
        }),
    });

    const { container } = renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /New Connect Session/ }));

    await waitFor(() =>
      expect(screen.getByText('Claude Desktop did not handle the deep link.')).toBeInTheDocument(),
    );

    const closeButton = container.querySelector('.ant-alert-close-icon');
    if (!closeButton) throw new Error('Expected alert close button');
    fireEvent.click(closeButton);

    await waitFor(() =>
      expect(
        screen.queryByText('Claude Desktop did not handle the deep link.'),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows the not-ready message on 503', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /New Connect Session/ }));

    await waitFor(() =>
      expect(
        screen.getByText('The agent is still starting up. Please try again shortly.'),
      ).toBeInTheDocument(),
    );
  });
});
