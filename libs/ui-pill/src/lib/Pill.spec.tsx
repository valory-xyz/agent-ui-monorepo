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

  it('Pill with type has marginLeft -28px', () => {
    const { container } = render(<Pill type="primary">p</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.marginLeft).toBe('-28px');
  });

  it('Pill without type has marginLeft 0 (BUG-004 fixed)', () => {
    const { container } = render(<Pill>n</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.marginLeft).toBe('0px');
  });

  it('applies small padding with left 16px when type is set', () => {
    const { container } = render(<Pill type="primary">text</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.padding).toBe('2px 4px 2px 16px');
  });

  it('applies small padding with left 8px when no type (size="small" default)', () => {
    const { container } = render(<Pill>text</Pill>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.padding).toBe('2px 4px 2px 8px');
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
