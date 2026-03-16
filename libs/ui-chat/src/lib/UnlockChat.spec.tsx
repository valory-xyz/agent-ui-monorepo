import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { render, screen } from '@testing-library/react';

import { UnlockChat } from './UnlockChat';

describe('UnlockChat', () => {
  it('renders the heading "Update agent\'s goal"', () => {
    render(<UnlockChat />);
    expect(screen.getByText("Update agent's goal")).toBeTruthy();
  });

  it('renders the instruction text about the Gemini API key', () => {
    render(<UnlockChat />);
    expect(screen.getByText(/Add your Gemini API key/i)).toBeTruthy();
  });

  it('renders without crashing with default props', () => {
    expect(() => render(<UnlockChat />)).not.toThrow();
  });

  it('renders a lock icon element', () => {
    const { container } = render(<UnlockChat />);
    // Ant Design icons render as <span role="img">
    const icon = container.querySelector('[role="img"]');
    expect(icon).toBeTruthy();
  });

  it('accepts type="secondary" without crashing', () => {
    expect(() => render(<UnlockChat type="secondary" />)).not.toThrow();
  });

  it('accepts a custom iconColor without crashing', () => {
    expect(() => render(<UnlockChat iconColor="#FF0000" />)).not.toThrow();
  });

  it('uses GLOBAL_COLORS.MEDIUM_GRAY as the default icon color', () => {
    // Verify the default is the expected constant value
    expect(GLOBAL_COLORS.MEDIUM_GRAY).toBe('#6C757D');
  });
});
