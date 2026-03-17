import { render } from '@testing-library/react';

import { HaloDot } from './HaloDot';

describe('HaloDot', () => {
  it('renders a single div element', () => {
    const { container } = render(<HaloDot dotColor="#FF0000" />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(container.children).toHaveLength(1);
  });

  it('different dotColors produce different CSS classes (styled-components applies distinct styles)', () => {
    const { container: c1 } = render(<HaloDot dotColor="#FF0000" />);
    const { container: c2 } = render(<HaloDot dotColor="#00FF00" />);
    expect(c1.firstElementChild?.className).not.toBe(c2.firstElementChild?.className);
  });

  it('different sizes produce different CSS classes', () => {
    const { container: c1 } = render(<HaloDot dotColor="#FF0000" size={6} />);
    const { container: c2 } = render(<HaloDot dotColor="#FF0000" size={12} />);
    expect(c1.firstElementChild?.className).not.toBe(c2.firstElementChild?.className);
  });

  it('different haloScales produce different CSS classes', () => {
    const { container: c1 } = render(<HaloDot dotColor="#FF0000" haloScale={2} />);
    const { container: c2 } = render(<HaloDot dotColor="#FF0000" haloScale={4} />);
    expect(c1.firstElementChild?.className).not.toBe(c2.firstElementChild?.className);
  });

  // opacity: 0.25 when haloColor === dotColor (default), 0.9 otherwise — different classes
  it('matching haloColor (default) produces different CSS class than mismatched haloColor', () => {
    const { container: c1 } = render(<HaloDot dotColor="#FF0000" />);
    const { container: c2 } = render(<HaloDot dotColor="#FF0000" haloColor="#0000FF" />);
    expect(c1.firstElementChild?.className).not.toBe(c2.firstElementChild?.className);
  });

  it('default size=6 and explicit size=6 produce the same CSS class', () => {
    const { container: c1 } = render(<HaloDot dotColor="#FF0000" />);
    const { container: c2 } = render(<HaloDot dotColor="#FF0000" size={6} />);
    expect(c1.firstElementChild?.className).toBe(c2.firstElementChild?.className);
  });

  it('default haloScale=2 and explicit haloScale=2 produce the same CSS class', () => {
    const { container: c1 } = render(<HaloDot dotColor="#FF0000" />);
    const { container: c2 } = render(<HaloDot dotColor="#FF0000" haloScale={2} />);
    expect(c1.firstElementChild?.className).toBe(c2.firstElementChild?.className);
  });

  it('injects dotColor into the document styles', () => {
    render(<HaloDot dotColor="#AABB11" />);
    const injectedCSS = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('');
    expect(injectedCSS).toContain('#AABB11');
  });
});
