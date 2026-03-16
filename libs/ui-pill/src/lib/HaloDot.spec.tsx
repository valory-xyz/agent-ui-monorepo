import { render } from '@testing-library/react';

import { HaloDot } from './HaloDot';

describe('HaloDot', () => {
  it('renders without crashing', () => {
    const { container } = render(<HaloDot dotColor="#FF0000" />);
    expect(container.firstElementChild).toBeTruthy();
  });

  it('renders a single root element', () => {
    const { container } = render(<HaloDot dotColor="#FF0000" />);
    expect(container.children).toHaveLength(1);
  });

  it('accepts a custom dotColor without throwing', () => {
    expect(() => render(<HaloDot dotColor="#00FF00" />)).not.toThrow();
  });

  it('accepts a custom haloColor without throwing', () => {
    expect(() => render(<HaloDot dotColor="#FF0000" haloColor="#0000FF" />)).not.toThrow();
  });

  it('accepts custom size and haloScale without throwing', () => {
    expect(() => render(<HaloDot dotColor="#FF0000" size={12} haloScale={3} />)).not.toThrow();
  });

  it('renders with default props (no size or haloScale required)', () => {
    // Only dotColor is required — defaults should not cause a crash
    const { container } = render(<HaloDot dotColor="#FFFFFF" />);
    expect(container.firstElementChild).toBeTruthy();
  });
});
