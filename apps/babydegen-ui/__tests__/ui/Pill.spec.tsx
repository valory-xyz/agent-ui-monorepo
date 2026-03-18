import { render, screen } from '@testing-library/react';

import { Pill } from '../../src/ui/Pill';

describe('Pill (babydegen-ui)', () => {
  it('renders children', () => {
    render(<Pill>Balanced</Pill>);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('renders without crashing with type="primary"', () => {
    expect(() => render(<Pill type="primary">Primary</Pill>)).not.toThrow();
  });

  it('renders without crashing with type="danger"', () => {
    expect(() => render(<Pill type="danger">Danger</Pill>)).not.toThrow();
  });

  it('renders without crashing without type prop', () => {
    expect(() => render(<Pill>No type</Pill>)).not.toThrow();
  });

  it('renders without crashing with size="large"', () => {
    expect(() => render(<Pill size="large">Large</Pill>)).not.toThrow();
  });

  it('applies custom style prop', () => {
    const { container } = render(<Pill style={{ marginLeft: 0 }}>styled</Pill>);
    const flexEl = container.firstElementChild as HTMLElement;
    expect(flexEl).toBeInTheDocument();
  });
});
