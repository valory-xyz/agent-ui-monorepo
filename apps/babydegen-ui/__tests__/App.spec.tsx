import { render, screen } from '@testing-library/react';

import App from '../src/App';

// Mock all heavy components to prevent deep dependency chains
jest.mock('../src/components/Portfolio/Portfolio', () => ({
  Portfolio: () => <div>Portfolio</div>,
}));

jest.mock('../src/components/Allocation/Allocation', () => ({
  Allocation: () => <div>Allocation</div>,
}));

jest.mock('../src/components/Strategy/Strategy', () => ({
  Strategy: () => <div>Strategy</div>,
}));

jest.mock('../src/components/Chat/Chat', () => ({
  Chat: () => <div>Chat</div>,
}));

jest.mock('../src/components/WithdrawAgentsFunds/WithdrawAgentsFunds', () => ({
  WithdrawAgentsFunds: () => <div>WithdrawAgentsFunds</div>,
}));

jest.mock('../src/hooks/useFeatures');
jest.mock('@agent-ui-monorepo/ui-theme', () => ({
  GlobalStyles: () => null,
}));
jest.mock('@agent-ui-monorepo/ui-chat', () => ({
  UnlockChat: () => <div>UnlockChat</div>,
}));

const { useFeatures } = jest.requireMock('../src/hooks/useFeatures') as {
  useFeatures: jest.Mock;
};

describe('App (babydegen-ui)', () => {
  beforeEach(() => {
    useFeatures.mockReturnValue({ isLoading: false, data: { isChatEnabled: true } });
  });

  it('renders Chat and Strategy when isChatEnabled=true', () => {
    render(<App />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Strategy')).toBeInTheDocument();
  });

  it('renders UnlockChat when isChatEnabled=false', () => {
    useFeatures.mockReturnValue({ isLoading: false, data: { isChatEnabled: false } });
    render(<App />);
    expect(screen.getByText('UnlockChat')).toBeInTheDocument();
    expect(screen.queryByText('Chat')).toBeNull();
  });

  it('renders nothing for StrategyAndChat when isLoading=true', () => {
    useFeatures.mockReturnValue({ isLoading: true, data: undefined });
    render(<App />);
    expect(screen.queryByText('Chat')).toBeNull();
    expect(screen.queryByText('UnlockChat')).toBeNull();
  });
});
