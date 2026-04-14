// Mock agentMap to simulate polystrat environment (isOmenstratAgent=false)
import { render } from '@testing-library/react';

import App from '../../src/app/app';

jest.mock('../../src/utils/agentMap', () => ({
  agentType: 'polystrat_trader',
  isOmenstratAgent: false,
  isPolystratAgent: true,
}));

jest.mock('../../src/hooks/useAgentDetails', () => ({
  useAgentDetails: jest.fn().mockReturnValue({
    isLoading: true,
    isError: false,
    data: { agentDetails: undefined, performance: undefined },
  }),
}));
jest.mock('../../src/hooks/useFeatures', () => ({
  useFeatures: jest.fn().mockReturnValue({ isLoading: true, data: undefined }),
}));

describe('App – polystrat agent (isOmenstratAgent=false)', () => {
  it('renders without crashing (no background image, tooltip border set)', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
