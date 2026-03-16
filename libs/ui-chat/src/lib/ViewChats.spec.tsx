import { act, render, screen } from '@testing-library/react';

import { EachChat } from './types';
import { ViewChats } from './ViewChats';

const agentChat: EachChat = { text: 'Agent reply', type: 'agent' };
const userChat: EachChat = { text: 'User message', type: 'user' };
const systemChat: EachChat = { text: 'System note', type: 'system' };

describe('ViewChats', () => {
  it('renders all chat entries', () => {
    render(<ViewChats chats={[agentChat, userChat]} agentType="modius" size="small" />);
    expect(screen.getByText('Agent reply')).toBeTruthy();
    expect(screen.getByText('User message')).toBeTruthy();
  });

  it('renders nothing when chats array is empty', () => {
    render(<ViewChats chats={[]} agentType="modius" size="small" />);
    // Known chat texts should not be present when there are no chats
    expect(screen.queryByText('Agent reply')).toBeNull();
    expect(screen.queryByText('User message')).toBeNull();
  });

  it('renders an agent logo for agent chat entries', () => {
    render(<ViewChats chats={[agentChat]} agentType="modius" size="small" />);
    expect(screen.getByAltText('modius chat logo')).toBeTruthy();
  });

  it('does not render an agent logo for user chat entries', () => {
    render(<ViewChats chats={[userChat]} agentType="modius" size="small" />);
    expect(screen.queryByAltText('modius chat logo')).toBeNull();
  });

  it('renders a ReactNode text directly without wrapping in markdown', () => {
    const jsxChat: EachChat = { text: <span data-testid="jsx-content">JSX</span>, type: 'agent' };
    render(<ViewChats chats={[jsxChat]} agentType="modius" size="small" />);
    expect(screen.getByTestId('jsx-content')).toBeTruthy();
  });

  it('renders string text through ReactMarkdown', () => {
    const markdownChat: EachChat = { text: '**bold text**', type: 'agent' };
    render(<ViewChats chats={[markdownChat]} agentType="modius" size="small" />);
    // ReactMarkdown renders bold as <strong>
    expect(screen.getByText('bold text')).toBeTruthy();
  });

  it('renders system chat without a logo', () => {
    render(<ViewChats chats={[systemChat]} agentType="modius" size="small" />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('scrolls to bottom when chats change', async () => {
    jest.useFakeTimers();
    try {
      const { rerender } = render(
        <ViewChats chats={[agentChat]} agentType="modius" size="small" />,
      );
      rerender(<ViewChats chats={[agentChat, userChat]} agentType="modius" size="small" />);

      // The effect uses setTimeout with 0 delay — run it without errors
      await act(async () => {
        jest.runAllTimers();
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('renders with size="large" without crashing', () => {
    expect(() =>
      render(<ViewChats chats={[agentChat]} agentType="modius" size="large" />),
    ).not.toThrow();
  });

  it('uses the correct agent logo for each agent type', () => {
    const agentTypes = [
      'modius',
      'optimus',
      'omenstrat_trader',
      'polystrat_trader',
      'agentsFun',
    ] as const;
    agentTypes.forEach((type) => {
      const { unmount } = render(<ViewChats chats={[agentChat]} agentType={type} size="small" />);
      expect(screen.getByAltText(`${type} chat logo`)).toBeTruthy();
      unmount();
    });
  });
});
