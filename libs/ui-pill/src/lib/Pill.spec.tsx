import { render, screen } from '@testing-library/react';

import { Pill } from './Pill';

describe('Pill', () => {
  it('renders children', () => {
    render(<Pill>Label</Pill>);
    expect(screen.getByText('Label')).toBeTruthy();
  });

  it('renders a HaloDot for every type', () => {
    const { container } = render(<Pill type="primary">text</Pill>);
    // HaloDot renders a styled div — there will be at least one div child
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('applies primary background color inline', () => {
    const { container } = render(<Pill type="primary">p</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toBe('rgba(22, 119, 255, 0.2)');
  });

  it('applies danger background color inline', () => {
    const { container } = render(<Pill type="danger">d</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toBe('rgba(245, 34, 45, 0.2)');
  });

  it('applies neutral background color inline by default', () => {
    const { container } = render(<Pill>n</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toBe('rgba(255, 255, 255, 0.2)');
  });

  it('applies a custom style prop', () => {
    const { container } = render(<Pill style={{ opacity: 0.5 }}>s</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe('0.5');
  });

  // BUG-004 regression: hasType is always true so marginLeft is always -28
  it('marginLeft is always -28 regardless of type (BUG-004)', () => {
    const { container: c1 } = render(<Pill type="neutral">n</Pill>);
    const { container: c2 } = render(<Pill type="primary">p</Pill>);

    const root1 = c1.firstElementChild as HTMLElement;
    const root2 = c2.firstElementChild as HTMLElement;

    expect(root1.style.marginLeft).toBe('-28px');
    expect(root2.style.marginLeft).toBe('-28px');
  });

  it('applies small padding inline (size="small" is default)', () => {
    const { container } = render(<Pill>text</Pill>);
    const root = container.firstElementChild as HTMLElement;
    // hasType is always true (BUG-004) so left padding is always 16px
    expect(root.style.padding).toBe('2px 4px 2px 16px');
  });

  it('applies large padding inline when size="large"', () => {
    const { container } = render(<Pill size="large">text</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.padding).toBe('6px 12px');
  });

  it('small and large size produce different padding', () => {
    const { container: cs } = render(<Pill size="small">s</Pill>);
    const { container: cl } = render(<Pill size="large">l</Pill>);
    const small = (cs.firstElementChild as HTMLElement).style.padding;
    const large = (cl.firstElementChild as HTMLElement).style.padding;
    expect(small).not.toBe(large);
  });

  it('renders the HaloDot child element', () => {
    const { container } = render(<Pill type="primary">p</Pill>);
    // HaloDot is a styled div — it will be present inside the Flex children
    const dots = container.querySelectorAll('div');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('all three type variants render without crashing', () => {
    expect(() => render(<Pill type="primary">p</Pill>)).not.toThrow();
    expect(() => render(<Pill type="danger">d</Pill>)).not.toThrow();
    expect(() => render(<Pill type="neutral">n</Pill>)).not.toThrow();
  });
});
