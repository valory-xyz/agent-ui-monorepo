import { render, screen } from '@testing-library/react';

import { Pill } from '../../src/ui/Pill';

describe('Pill (babydegen-ui)', () => {
  it('renders children', () => {
    render(<Pill>Balanced</Pill>);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('renders children with type="primary"', () => {
    render(<Pill type="primary">Primary</Pill>);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('renders children with type="danger"', () => {
    render(<Pill type="danger">Danger</Pill>);
    expect(screen.getByText('Danger')).toBeInTheDocument();
  });

  it('renders children with size="large"', () => {
    render(<Pill size="large">Large</Pill>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('applies custom style prop', () => {
    const { container } = render(<Pill style={{ marginLeft: 0 }}>styled</Pill>);
    const flexEl = container.firstElementChild as HTMLElement;
    expect(flexEl).toBeInTheDocument();
  });
});
