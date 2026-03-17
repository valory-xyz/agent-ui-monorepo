import { render, screen } from '@testing-library/react';
import { Frown, Unplug } from 'lucide-react';

import { ErrorState } from '../../src/components/ErrorState';

describe('ErrorState', () => {
  it('renders the title', () => {
    render(
      <ErrorState title="Error loading data" description="Something went wrong." icon={Unplug} />,
    );
    expect(screen.getByText('Error loading data')).toBeTruthy();
  });

  it('renders the description', () => {
    render(<ErrorState title="Error" description="Please try again." icon={Unplug} />);
    expect(screen.getByText('Please try again.')).toBeTruthy();
  });

  it('renders an SVG icon element', () => {
    const { container } = render(<ErrorState title="Error" description="Details" icon={Frown} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders without crashing with all required props', () => {
    expect(() =>
      render(<ErrorState title="404" description="Not found." icon={Frown} />),
    ).not.toThrow();
  });
});
