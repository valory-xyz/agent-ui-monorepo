import { useChats } from '@agent-ui-monorepo/ui-chat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { Chat } from '../../../src/components/Chat/Chat';

let capturedOnSuccess: ((data: unknown) => void) | undefined;
let capturedOnError: ((err: { message?: string }) => void) | undefined;

// Mock hooks that Chat depends on
jest.mock('@agent-ui-monorepo/ui-chat', () => {
  const actual = jest.requireActual('@agent-ui-monorepo/ui-chat');
  return {
    ...actual,
    useChats: jest.fn(),
    // keep the real handleChatError so the rollback path is exercised
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Chat (predict-ui)', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnSuccess = undefined;
    capturedOnError = undefined;
    mockMutateAsync.mockImplementation(
      (
        _text: string,
        opts: { onSuccess: (d: unknown) => void; onError: (e: { message?: string }) => void },
      ) => {
        capturedOnSuccess = opts.onSuccess;
        capturedOnError = opts.onError;
        return Promise.resolve();
      },
    );
    (useChats as jest.Mock).mockReturnValue({
      isPending: false,
      mutateAsync: mockMutateAsync,
    });
  });

  it('renders without crashing', () => {
    expect(() => render(<Chat />, { wrapper: createWrapper() })).not.toThrow();
  });

  it('renders the textarea for input', () => {
    render(<Chat />, { wrapper: createWrapper() });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the send button', () => {
    render(<Chat />, { wrapper: createWrapper() });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not call mutateAsync for empty input', async () => {
    render(<Chat />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button'));
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows loading state when isPending=true', () => {
    (useChats as jest.Mock).mockReturnValue({
      isPending: true,
      mutateAsync: mockMutateAsync,
    });
    const { container } = render(<Chat />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-btn-loading')).toBeInTheDocument();
  });

  it('sends message on Enter key press with text', async () => {
    render(<Chat />, { wrapper: createWrapper() });
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'test message' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('adds user message to chat after sending', async () => {
    render(<Chat />, { wrapper: createWrapper() });
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'hello agent' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('hello agent')).toBeInTheDocument());
  });

  it('invalidates 3 queries on success', async () => {
    const invalidateQueries = jest.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    jest.spyOn(queryClient, 'invalidateQueries').mockImplementation(invalidateQueries);

    mockMutateAsync.mockImplementation(
      (_text: string, opts: { onSuccess: (d: unknown) => void }) => {
        opts.onSuccess({ reasoning: '', trading_type: 'balanced' });
        return Promise.resolve();
      },
    );

    render(createElement(QueryClientProvider, { client: queryClient }, createElement(Chat)));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'prompt' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(invalidateQueries).toHaveBeenCalledTimes(3));
  });

  it('onSuccess: shows agent reasoning message in chat', async () => {
    render(<Chat />, { wrapper: createWrapper() });
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'question' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({
      reasoning: 'Market conditions favour balanced strategy.',
      trading_type: null,
    });

    await waitFor(() =>
      expect(screen.getByText('Market conditions favour balanced strategy.')).toBeInTheDocument(),
    );
  });

  it('onSuccess: shows TradingStrategy system chat when type changes', async () => {
    render(<Chat />, { wrapper: createWrapper() });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'switch' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({
      reasoning: '',
      previous_trading_type: 'balanced',
      trading_type: 'risky',
    });

    await waitFor(() => expect(screen.getByText('Strategy updated:')).toBeInTheDocument());
  });

  it('onSuccess: does not push agent chat when reasoning is absent/empty', async () => {
    render(<Chat />, { wrapper: createWrapper() });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'q' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({ reasoning: '' });

    // Only the user message (not an agent message)
    await waitFor(() => expect(screen.getByText('q')).toBeInTheDocument());
    expect(screen.queryByText(/conditions/)).toBeNull();
  });

  it('onError: restores text input via handleChatError rollback', async () => {
    render(<Chat />, { wrapper: createWrapper() });
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'my prompt' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(capturedOnError).toBeDefined());
    if (!capturedOnError) throw new Error('capturedOnError not set');
    capturedOnError({ message: 'Network error' });

    // After error, text is restored to the sent message
    await waitFor(() =>
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('my prompt'),
    );
  });
});
