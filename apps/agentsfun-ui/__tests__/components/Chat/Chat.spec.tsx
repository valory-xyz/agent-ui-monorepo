import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { notification } from 'antd';
import { createElement } from 'react';

import { Chat } from '../../../src/components/Chat/Chat';

let capturedOnSuccess: ((data: unknown) => void) | undefined;
let capturedOnError: ((error: Error) => void) | undefined;

const mockMutateAsync = jest.fn();

jest.mock('@agent-ui-monorepo/ui-chat', () => {
  const actual = jest.requireActual('@agent-ui-monorepo/ui-chat');
  return {
    ...actual,
    Chat: ({
      currentText,
      chats,
      isLoading,
      onCurrentTextChange,
      onSend,
    }: {
      currentText: string;
      chats: { text: unknown; type: string }[];
      isLoading: boolean;
      onCurrentTextChange: (value: string) => void;
      onSend: () => void;
    }) => (
      <div>
        <div data-testid="is-loading">{isLoading ? 'loading' : 'idle'}</div>
        <div data-testid="chat-count">{chats.length}</div>
        <div data-testid="chat-messages">
          {chats.map((chat, index) => (
            <div key={index}>{typeof chat.text === 'string' ? chat.text : chat.type}</div>
          ))}
        </div>
        <input
          data-testid="chat-input"
          value={currentText}
          onChange={(event) => onCurrentTextChange(event.target.value)}
        />
        <button data-testid="send-button" onClick={onSend}>
          Send
        </button>
      </div>
    ),
    useChats: jest.fn(() => ({
      isPending: false,
      mutateAsync: mockMutateAsync,
    })),
  };
});

const createWrapper = (queryClient?: QueryClient) => {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
};

describe('Chat (agentsfun-ui)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnSuccess = undefined;
    capturedOnError = undefined;
    jest.spyOn(notification, 'error').mockImplementation(jest.fn());
    mockMutateAsync.mockImplementation(
      (
        _text: string,
        options: { onSuccess: (data: unknown) => void; onError: (error: Error) => void },
      ) => {
        capturedOnSuccess = options.onSuccess;
        capturedOnError = options.onError;
        return Promise.resolve();
      },
    );
  });

  it('does not send empty or whitespace-only messages', () => {
    render(<Chat />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTestId('send-button'));
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('send-button'));

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('adds the user message and clears the input when sending', async () => {
    render(<Chat />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'refine persona' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => expect(screen.getByTestId('chat-count')).toHaveTextContent('1'));
    expect(screen.getByText('refine persona')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toHaveValue('');
  });

  it('invalidates agentInfo and appends agent reasoning on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    render(<Chat />, { wrapper: createWrapper(queryClient) });

    fireEvent.change(screen.getByTestId('chat-input'), {
      target: { value: 'make it more playful' },
    });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('Expected onSuccess to be captured');

    await act(async () => {
      capturedOnSuccess?.({ reasoning: 'Updated tone to be more playful.' });
    });

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['agentInfo'] });
      expect(screen.getByText('Updated tone to be more playful.')).toBeInTheDocument();
    });
  });

  it('does not append an agent response when reasoning is empty', async () => {
    render(<Chat />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'keep it concise' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    if (!capturedOnSuccess) throw new Error('Expected onSuccess to be captured');

    await act(async () => {
      capturedOnSuccess?.({ reasoning: '' });
    });

    await waitFor(() => expect(screen.getByTestId('chat-count')).toHaveTextContent('1'));
  });

  it('rolls back the input text when send fails', async () => {
    render(<Chat />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'restore this text' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => expect(capturedOnError).toBeDefined());
    if (!capturedOnError) throw new Error('Expected onError to be captured');

    await act(async () => {
      capturedOnError?.(new Error('Request failed'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('chat-count')).toHaveTextContent('0');
      expect(screen.getByTestId('chat-input')).toHaveValue('restore this text');
    });
  });

  it('leaves the optimistic chat in place when handleChatError returns null', async () => {
    const chatModule = jest.requireMock('@agent-ui-monorepo/ui-chat') as {
      handleChatError: typeof import('@agent-ui-monorepo/ui-chat').handleChatError;
    };
    const handleChatErrorSpy = jest.spyOn(chatModule, 'handleChatError').mockReturnValue(null);

    render(<Chat />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByTestId('chat-input'), {
      target: { value: 'keep optimistic state' },
    });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => expect(capturedOnError).toBeDefined());
    await act(async () => {
      capturedOnError?.(new Error('Request failed'));
    });

    expect(handleChatErrorSpy).toHaveBeenCalled();
    expect(screen.getByTestId('chat-count')).toHaveTextContent('1');
    expect(screen.getByTestId('chat-input')).toHaveValue('');
  });

  it('passes through the pending state from useChats', () => {
    const { useChats } = jest.requireMock('@agent-ui-monorepo/ui-chat') as {
      useChats: jest.Mock;
    };
    useChats.mockReturnValue({ isPending: true, mutateAsync: mockMutateAsync });

    render(<Chat />, { wrapper: createWrapper() });
    expect(screen.getByTestId('is-loading')).toHaveTextContent('loading');
  });
});
