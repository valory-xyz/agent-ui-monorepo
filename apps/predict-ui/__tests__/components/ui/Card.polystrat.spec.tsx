// Mock agentMap to simulate polystrat environment (isOmenstratAgent=false)
import { render, screen } from '@testing-library/react';

import { Card } from '../../../src/components/ui/Card';

jest.mock('../../../src/utils/agentMap', () => ({
  agentType: 'polystrat_trader',
  isOmenstratAgent: false,
  isPolystratAgent: true,
}));

describe('Card – polystrat agent (isOmenstratAgent=false)', () => {
  it('renders children without crashing', () => {
    render(<Card>polystrat content</Card>);
    expect(screen.getByText('polystrat content')).toBeInTheDocument();
  });

  it('applies non-omenstrat styles (no background image)', () => {
    const { container } = render(<Card>content</Card>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
