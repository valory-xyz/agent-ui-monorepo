import { render } from '@testing-library/react';

import App from '../../src/app/app';
import { useAgentDetails } from '../../src/hooks/useAgentDetails';
import { useFeatures } from '../../src/hooks/useFeatures';

jest.mock('../../src/hooks/useAgentDetails');
jest.mock('../../src/hooks/useFeatures');

describe('App (predict-ui)', () => {
  beforeEach(() => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: { agentDetails: undefined, performance: undefined },
    });
    (useFeatures as jest.Mock).mockReturnValue({ isLoading: true, data: undefined });
  });

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('renders an ErrorBoundary wrapper (renders children)', () => {
    const { container } = render(<App />);
    // App renders inside a div — just verify something is rendered
    expect(container.firstChild).toBeTruthy();
  });
});
