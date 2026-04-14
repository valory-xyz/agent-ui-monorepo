import { render, screen } from '@testing-library/react';

import { Card, CardV2 } from '../../../src/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(<Card>content here</Card>);
    expect(getByText('content here')).toBeInTheDocument();
  });

  it('renders with default props', () => {
    const { container } = render(<Card />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts $padding prop and renders children', () => {
    render(<Card $padding="16px 32px">test</Card>);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('accepts $gap prop and renders children', () => {
    render(<Card $gap="16px">test</Card>);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});

describe('CardV2', () => {
  it('renders children', () => {
    const { getByText } = render(<CardV2>content here</CardV2>);
    expect(getByText('content here')).toBeInTheDocument();
  });

  it('renders with default props', () => {
    const { container } = render(<CardV2 />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
