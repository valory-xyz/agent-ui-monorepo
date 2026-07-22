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
});
