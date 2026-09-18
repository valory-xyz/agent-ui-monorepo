import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CodingTool } from '../../src/components/CodingTool/CodingTool';
import { ConnectSettings } from '../../src/types';

const settings: ConnectSettings = {
  protected: { mode: 'restricted', whitelist: { gnosis: ['0xabc'] } },
  harness: 'claude_code_desktop',
};

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CodingTool settings={settings} />
    </QueryClientProvider>,
  );
};

describe('CodingTool', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });

  it('renders the section copy and the current coding tool', () => {
    renderComponent();

    expect(screen.getByText('Coding tool')).toBeInTheDocument();
    expect(screen.getByText('Choose where you run your Connect agent.')).toBeInTheDocument();
    expect(screen.getByText('Claude Desktop')).toBeInTheDocument();
  });

  it('offers every harness the server accepts', async () => {
    // pearl-connect rejects a harness outside its own HARNESSES list, so an
    // option missing here is a tool the operator simply cannot reach.
    const { container } = renderComponent();

    const selector = container.querySelector('.ant-select-selector');
    if (!selector) throw new Error('Expected select to be rendered');
    fireEvent.mouseDown(selector);

    // read the dropdown itself: the current value renders the same text again
    const optionLabels = () =>
      Array.from(document.querySelectorAll('.ant-select-item-option-content')).map(
        (option) => option.textContent,
      );
    await waitFor(() => expect(optionLabels()).toHaveLength(4));
    expect(optionLabels()).toEqual([
      'Claude Desktop',
      'Claude Code CLI',
      'Codex Desktop',
      'Codex CLI',
    ]);
  });

  it('PATCHes the harness without a password when another tool is selected', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ...settings, harness: 'claude_code_cli' }),
    });

    const { container } = renderComponent();

    const selector = container.querySelector('.ant-select-selector');
    if (!selector) throw new Error('Expected select to be rendered');
    fireEvent.mouseDown(selector);
    fireEvent.click(await screen.findByText('Claude Code CLI'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/settings');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({ harness: 'claude_code_cli' });
    expect(screen.queryByText(/Enter your password/)).not.toBeInTheDocument();
  });

  it('sends the codex value the server expects, not the label', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ...settings, harness: 'codex_cli' }),
    });

    const { container } = renderComponent();

    const selector = container.querySelector('.ant-select-selector');
    if (!selector) throw new Error('Expected select to be rendered');
    fireEvent.mouseDown(selector);
    fireEvent.click(await screen.findByText('Codex CLI'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ harness: 'codex_cli' });
  });
});
