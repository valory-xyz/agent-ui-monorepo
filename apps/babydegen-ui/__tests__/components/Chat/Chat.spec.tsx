import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { notification } from 'antd';

import { Chat } from '../../../src/components/Chat/Chat';

// Track what mutateAsync was called with so we can simulate onSuccess/onError
let capturedOnSuccess: ((data: unknown) => void) | undefined;
let capturedOnError: ((error: { message?: string }) => void) | undefined;
const mockMutateAsync = jest.fn();

jest.mock('@agent-ui-monorepo/ui-chat', () => ({
  Chat: ({
    currentText,
    onCurrentTextChange,
    onSend,
    isLoading,
    chats,
  }: {
    currentText: string;
    onCurrentTextChange: (t: string) => void;
    onSend: () => void;
    isLoading: boolean;
    chats: { type: string; text: unknown }[];
  }) => (
    <div>
      <div data-testid="chat-loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="chat-count">{chats.length}</div>
      <div data-testid="last-chat-type">{chats[chats.length - 1]?.type ?? 'none'}</div>
      <input
        data-testid="chat-input"
        value={currentText}
        onChange={(e) => onCurrentTextChange(e.target.value)}
      />
      <button data-testid="send-btn" onClick={onSend}>
        Send
      </button>
    </div>
  ),
  useChats: jest.fn(() => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  })),
}));

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return { ...actual, notification: { error: jest.fn() } };
});

describe('Chat (babydegen-ui)', () => {
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
  });

  it('starts with empty chat list', () => {
    render(<Chat />);
    expect(screen.getByTestId('chat-count').textContent).toBe('0');
  });

  it('starts with isLoading=false', () => {
    render(<Chat />);
    expect(screen.getByTestId('chat-loading').textContent).toBe('not-loading');
  });

  it('does not call mutateAsync for empty input', async () => {
    render(<Chat />);
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('does not call mutateAsync for whitespace-only input', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('adds user message to chat when valid text is sent', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'hello agent' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('chat-count').textContent).toBe('1');
    });
    expect(screen.getByTestId('last-chat-type').textContent).toBe('user');
  });

  it('clears input after sending', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'test' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => {
      expect((screen.getByTestId('chat-input') as HTMLInputElement).value).toBe('');
    });
  });

  it('calls mutateAsync with the typed text', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'my question' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
    expect(mockMutateAsync).toHaveBeenCalledWith(
      'my question',
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it('onSuccess: pushes agent chat when reasoning is present', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'q' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({ reasoning: 'Because of the market conditions.' });

    await waitFor(() => {
      // user + agent = 2
      expect(screen.getByTestId('chat-count').textContent).toBe('2');
      expect(screen.getByTestId('last-chat-type').textContent).toBe('agent');
    });
  });

  it('onSuccess: does not push agent chat when reasoning is empty', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'q' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({ reasoning: '', trading_type: null });

    await waitFor(() => {
      // only user message
      expect(screen.getByTestId('chat-count').textContent).toBe('1');
    });
  });

  it('onSuccess: pushes system chat when trading type changes', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'q' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({ reasoning: '', previous_trading_type: 'risky', trading_type: 'balanced' });

    await waitFor(() => {
      // user + system = 2
      expect(screen.getByTestId('chat-count').textContent).toBe('2');
      expect(screen.getByTestId('last-chat-type').textContent).toBe('system');
    });
  });

  it('onSuccess: pushes system chat when selected_protocols is non-empty', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'q' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({ reasoning: '', selected_protocols: ['balancerPool'] });

    await waitFor(() => {
      // user + system = 2
      expect(screen.getByTestId('chat-count').textContent).toBe('2');
      expect(screen.getByTestId('last-chat-type').textContent).toBe('system');
    });
  });

  it('onSuccess: does not push system chat when selected_protocols is empty', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'q' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('capturedOnSuccess not set');
    capturedOnSuccess({ reasoning: '', selected_protocols: [] });

    await waitFor(() => {
      expect(screen.getByTestId('chat-count').textContent).toBe('1');
    });
  });

  it('onError: calls notification.error with the error message', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'q' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(capturedOnError).toBeDefined());
    if (!capturedOnError) throw new Error('capturedOnError not set');
    capturedOnError({ message: 'Network failure' });

    expect(notification.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Network failure' }),
    );
  });

  it('onError: uses fallback message when error has no message', async () => {
    render(<Chat />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'q' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => expect(capturedOnError).toBeDefined());
    if (!capturedOnError) throw new Error('capturedOnError not set');
    capturedOnError({});

    expect(notification.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Failed to send chat.' }),
    );
  });
});
