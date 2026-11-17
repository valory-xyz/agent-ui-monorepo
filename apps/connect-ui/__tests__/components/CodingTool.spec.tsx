import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CodingTool } from '../../src/components/CodingTool/CodingTool';
import { ConnectSettings, HarnessOption } from '../../src/types';

const harnesses: HarnessOption[] = [
  { id: 'claude_code_desktop', available: true },
  { id: 'claude_code_cli', available: true },
  { id: 'codex_desktop', available: true },
  { id: 'codex_cli', available: true },
  { id: 'ocb_cli', available: true },
];

const settings: ConnectSettings = {
  protected: { mode: 'restricted', whitelist: { gnosis: ['0xabc'] } },
  harness: 'claude_code_desktop',
  harnesses,
};

const withOcb = (ocb: HarnessOption): ConnectSettings => ({
  ...settings,
  harnesses: [...harnesses.slice(0, 4), ocb],
});

const openDropdown = (container: HTMLElement) => {
  const selector = container.querySelector('.ant-select-selector');
  if (!selector) throw new Error('Expected select to be rendered');
  fireEvent.mouseDown(selector);
};

// read the dropdown itself: the current value renders the same text again
const optionLabels = () =>
  Array.from(document.querySelectorAll('.ant-select-item-option-content')).map(
    (option) => option.textContent,
  );

const renderComponent = (props: ConnectSettings = settings) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CodingTool settings={props} />
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

  it('offers the harnesses the server lists, in its order', async () => {
    const { container } = renderComponent({
      ...settings,
      harnesses: [...harnesses].reverse(),
    });
    openDropdown(container);

    await waitFor(() => expect(optionLabels()).toHaveLength(5));
    expect(optionLabels()).toEqual([
      'OCB CLI',
      'Codex CLI',
      'Codex Desktop',
      'Claude Code CLI',
      'Claude Desktop',
    ]);
  });

  it('offers the four known tools on a Connect build without harnesses', async () => {
    // Connect before harness availability answers GET /settings without the list
    const { harnesses: _omitted, ...legacy } = settings;
    const { container } = renderComponent(legacy);
    openDropdown(container);

    await waitFor(() => expect(optionLabels()).toHaveLength(4));
    expect(optionLabels()).toEqual([
      'Claude Desktop',
      'Claude Code CLI',
      'Codex Desktop',
      'Codex CLI',
    ]);
    expect(document.querySelector('.ant-select-item-option-disabled')).toBeNull();
  });

  it('skips a harness this build has no name for', async () => {
    const unknown = {
      id: 'cursor_cli',
      available: true,
    } as unknown as HarnessOption;
    const { container } = renderComponent({
      ...settings,
      harnesses: [...harnesses, unknown],
    });
    openDropdown(container);

    await waitFor(() => expect(optionLabels()).toHaveLength(5));
    expect(optionLabels()).not.toContain('cursor_cli');
  });

  it.each([
    ['windows_unsupported', 'Not available on Windows yet'],
    ['model_unavailable', 'Not available on this chain yet'],
  ] as const)(
    'shows OCB CLI disabled with its reason when %s',
    async (unavailable_reason, text) => {
      const { container } = renderComponent(
        withOcb({ id: 'ocb_cli', available: false, unavailable_reason }),
      );
      openDropdown(container);

      const reason = await screen.findByText(text);
      const option = reason.closest('.ant-select-item-option');
      expect(option).toHaveClass('ant-select-item-option-disabled');
      expect(option).toHaveTextContent('OCB CLI');

      fireEvent.click(reason);
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
      expect(global.fetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['no reason', { id: 'ocb_cli', available: false }],
    [
      'a reason this build does not know',
      { id: 'ocb_cli', available: false, unavailable_reason: 'kernel_too_old' },
    ],
  ])('still explains a disabled option with %s', async (_case, option) => {
    const { container } = renderComponent(withOcb(option as unknown as HarnessOption));
    openDropdown(container);

    const reason = await screen.findByText('Not available here yet');
    const item = reason.closest('.ant-select-item-option');
    expect(item).toHaveClass('ant-select-item-option-disabled');
    expect(item).toHaveTextContent('OCB CLI');

    fireEvent.click(reason);
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('selects OCB CLI like any other tool when it is available', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ...settings, harness: 'ocb_cli' }),
    });

    const { container } = renderComponent();
    openDropdown(container);
    fireEvent.click(await screen.findByText('OCB CLI'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ harness: 'ocb_cli' });
  });

  it('keeps the current tool and shows why the server refused a change', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          detail: 'harness ocb_cli is unavailable: model_unavailable',
        }),
    });

    const { container } = renderComponent();
    openDropdown(container);
    fireEvent.click(await screen.findByText('OCB CLI'));

    // the selection staying put is the hook's job (useUpdateSettings.spec)
    const alert = await screen.findByText('harness ocb_cli is unavailable: model_unavailable');

    const close = alert.closest('.ant-alert')?.querySelector('.ant-alert-close-icon');
    if (!close) throw new Error('Expected a closable alert');
    fireEvent.click(close);
    await waitFor(() =>
      expect(
        screen.queryByText('harness ocb_cli is unavailable: model_unavailable'),
      ).not.toBeInTheDocument(),
    );
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
