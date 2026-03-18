import { render, screen } from '@testing-library/react';

import { EmptyState } from '../../../src/components/ui/EmptyState';

describe('EmptyState (agentsfun-ui)', () => {
  it('renders placeholder content for both string and ReactNode messages', () => {
    const { rerender } = render(<EmptyState logo="/logo.png" message="No activity yet" />);

    expect(screen.getByText('No activity yet')).toBeInTheDocument();
    expect(screen.getByAltText('No recent activity')).toBeInTheDocument();

    rerender(<EmptyState logo="/logo.png" message={<span>Still nothing to show</span>} />);

    expect(screen.getByText('Still nothing to show')).toBeInTheDocument();
  });
});
