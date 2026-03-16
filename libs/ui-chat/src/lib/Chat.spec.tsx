import { fireEvent, render, screen } from '@testing-library/react';

import { Chat } from './Chat';
import { EachChat } from './types';

// Mock ViewChats to isolate Chat component
jest.mock('./ViewChats', () => ({
  ViewChats: ({ chats }: { chats: EachChat[] }) => (
    <div data-testid="view-chats">{chats.length} chats</div>
  ),
}));

const defaultProps = {
  isLoading: false,
  currentText: '',
  chats: [] as EachChat[],
  onCurrentTextChange: jest.fn(),
  onSend: jest.fn(),
  agentType: 'modius' as const,
};

describe('Chat (ui-chat)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the heading "Update agent\'s goal"', () => {
    render(<Chat {...defaultProps} />);
    expect(screen.getByText("Update agent's goal")).toBeTruthy();
  });

  it('shows the empty state logo when chats array is empty', () => {
    const { container } = render(<Chat {...defaultProps} chats={[]} />);
    expect(screen.queryByTestId('view-chats')).toBeNull();
    // The empty chat renders an <img> element
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('shows ViewChats when chats has entries', () => {
    const chats: EachChat[] = [{ text: 'hello', type: 'user' }];
    render(<Chat {...defaultProps} chats={chats} />);
    expect(screen.getByTestId('view-chats')).toBeTruthy();
  });

  it('renders the textarea', () => {
    render(<Chat {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('uses "Describe the agent\'s persona" placeholder for agentsFun', () => {
    render(<Chat {...defaultProps} agentType="agentsFun" />);
    expect(screen.getByPlaceholderText("Describe the agent's persona")).toBeTruthy();
  });

  it('uses "Give the agent custom guidance" placeholder for other agent types', () => {
    render(<Chat {...defaultProps} agentType="modius" />);
    expect(screen.getByPlaceholderText('Give the agent custom guidance')).toBeTruthy();
  });

  it('calls onCurrentTextChange when the user types', () => {
    const onCurrentTextChange = jest.fn();
    render(<Chat {...defaultProps} onCurrentTextChange={onCurrentTextChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new text' } });
    expect(onCurrentTextChange).toHaveBeenCalledWith('new text');
  });

  it('calls onSend when the send button is clicked', () => {
    const onSend = jest.fn();
    render(<Chat {...defaultProps} onSend={onSend} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('calls onSend when Enter is pressed in the textarea', () => {
    const onSend = jest.fn();
    render(<Chat {...defaultProps} onSend={onSend} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: false });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('does not call onSend when Shift+Enter is pressed', () => {
    const onSend = jest.fn();
    render(<Chat {...defaultProps} onSend={onSend} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('button shows loading state when isLoading is true', () => {
    const { container } = render(<Chat {...defaultProps} isLoading={true} />);
    // Ant Design loading button adds aria-busy or a loading class
    const btn = container.querySelector('.ant-btn-loading');
    expect(btn).toBeTruthy();
  });

  it('renders with size="large" without crashing', () => {
    expect(() => render(<Chat {...defaultProps} size="large" />)).not.toThrow();
  });
});
