import { render, screen } from '@testing-library/react';

import { Card } from '../../../src/components/ui/Card';

describe('Card (agentsfun-ui)', () => {
  it('renders its children', () => {
    render(<Card>Agent content</Card>);
    expect(screen.getByText('Agent content')).toBeInTheDocument();
  });
});
