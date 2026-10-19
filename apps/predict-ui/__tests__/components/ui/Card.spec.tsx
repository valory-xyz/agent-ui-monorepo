import { render, screen } from '@testing-library/react';

import { Card } from '../../../src/components/ui/Card';

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
