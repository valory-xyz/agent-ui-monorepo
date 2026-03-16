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

  it('applies MEDIUM_GRAY as the default color on the lock icon', () => {
    const { container } = render(<UnlockChat />);
    const icon = container.querySelector('[role="img"]') as HTMLElement;
    // jsdom normalizes hex to rgb() — use a reference element to get the same normalization
    const ref = document.createElement('span');
    ref.style.color = GLOBAL_COLORS.MEDIUM_GRAY;
    expect(icon.style.color).toBe(ref.style.color);
  });

  it('applies a custom iconColor to the lock icon', () => {
    const { container } = render(<UnlockChat iconColor="#FF0000" />);
    const icon = container.querySelector('[role="img"]') as HTMLElement;
    const ref = document.createElement('span');
    ref.style.color = '#FF0000';
    expect(icon.style.color).toBe(ref.style.color);
  });

  it('different iconColor values produce different icon styles', () => {
    const { container: c1 } = render(<UnlockChat iconColor="#FF0000" />);
    const { container: c2 } = render(<UnlockChat iconColor="#0000FF" />);
    const color1 = (c1.querySelector('[role="img"]') as HTMLElement).style.color;
    const color2 = (c2.querySelector('[role="img"]') as HTMLElement).style.color;
    expect(color1).not.toBe(color2);
  });

  it('renders the full instruction text', () => {
    render(<UnlockChat />);
    expect(
      screen.getByText(
        'Add your Gemini API key in Agent Settings on the Pearl Home screen to unlock this feature.',
      ),
    ).toBeTruthy();
  });
});
