import { render, screen } from '@testing-library/react';

import App from '../../src/app/app';
import { useFeatures } from '../../src/hooks/useFeatures';

let mockShouldThrowInPersona = false;

jest.mock('../../src/hooks/useFeatures');
jest.mock('../../src/components/Persona', () => ({
  Persona: () => {
    if (mockShouldThrowInPersona) throw new Error('Persona exploded');
    return <div>Persona</div>;
  },
}));
jest.mock('../../src/components/Performance', () => ({
  Performance: () => <div>Performance</div>,
}));
jest.mock('../../src/components/XActivity', () => ({
  XActivity: () => <div>XActivity</div>,
}));
jest.mock('../../src/components/Chat/Chat', () => ({
  Chat: () => <div>Chat</div>,
}));
jest.mock('../../src/components/AiGeneratedMedia', () => ({
  AiGeneratedMedia: () => <div>AiGeneratedMedia</div>,
}));
jest.mock('@agent-ui-monorepo/ui-theme', () => ({
  GlobalStyles: () => null,
}));
jest.mock('@agent-ui-monorepo/ui-chat', () => ({
  UnlockChat: () => <div>UnlockChat</div>,
}));

describe('App (agentsfun-ui)', () => {
  beforeEach(() => {
    mockShouldThrowInPersona = false;
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the main content when chat is enabled', () => {
    (useFeatures as jest.Mock).mockReturnValue({ isLoading: false, data: { isChatEnabled: true } });

    render(<App />);

    expect(screen.getByText('Persona')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('XActivity')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('AiGeneratedMedia')).toBeInTheDocument();
  });

  it('renders UnlockChat when chat is disabled', () => {
    (useFeatures as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { isChatEnabled: false },
    });

    render(<App />);

    expect(screen.getByText('UnlockChat')).toBeInTheDocument();
    expect(screen.queryByText('Chat')).toBeNull();
  });

  it('renders no chat section while feature flags are still loading', () => {
    (useFeatures as jest.Mock).mockReturnValue({ isLoading: true, data: undefined });

    render(<App />);

    expect(screen.queryByText('UnlockChat')).toBeNull();
    expect(screen.queryByText('Chat')).toBeNull();
  });

  it('uses the ErrorBoundary to render a fallback when a child throws', () => {
    mockShouldThrowInPersona = true;
    (useFeatures as jest.Mock).mockReturnValue({ isLoading: false, data: { isChatEnabled: true } });

    render(<App />);

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});
