import { render } from '@testing-library/react';

import { Card, CardV2 } from '../../../src/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(<Card>content here</Card>);
    expect(getByText('content here')).toBeTruthy();
  });

  it('renders without crashing with default props', () => {
    expect(() => render(<Card />)).not.toThrow();
  });

  it('accepts $padding prop without crashing', () => {
    expect(() => render(<Card $padding="16px 32px">test</Card>)).not.toThrow();
  });

  it('accepts $gap prop without crashing', () => {
    expect(() => render(<Card $gap="16px">test</Card>)).not.toThrow();
  });
});

describe('CardV2', () => {
  it('renders children', () => {
    const { getByText } = render(<CardV2>content here</CardV2>);
    expect(getByText('content here')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => render(<CardV2 />)).not.toThrow();
  });
});
