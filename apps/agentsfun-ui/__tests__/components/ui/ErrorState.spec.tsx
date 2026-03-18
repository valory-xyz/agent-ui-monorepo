import { render, screen } from '@testing-library/react';

import { ErrorState } from '../../../src/components/ui/ErrorState';

describe('ErrorState (agentsfun-ui)', () => {
  it('renders the provided message and logo', () => {
    render(<ErrorState message="Unable to load content" />);

    expect(screen.getByText('Unable to load content')).toBeInTheDocument();
    expect(screen.getByAltText('Error loading activity')).toBeInTheDocument();
  });
});
