import { render, screen } from '@testing-library/react';

import { Alert } from '../../../src/components/ui/Alert';

describe('Alert', () => {
  it('renders the message text', () => {
    render(<Alert type="warning" message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders the description when provided', () => {
    render(<Alert type="warning" message="Warning" description="More details here" />);
    expect(screen.getByText('More details here')).toBeTruthy();
  });

  it('renders without crashing for type="error"', () => {
    expect(() => render(<Alert type="error" message="Error occurred" />)).not.toThrow();
  });

  it('renders without crashing for type="warning"', () => {
    expect(() => render(<Alert type="warning" message="Warning" />)).not.toThrow();
  });

  it('renders with ReactNode message', () => {
    const { getByText } = render(<Alert type="error" message={<span>Custom node</span>} />);
    expect(getByText('Custom node')).toBeTruthy();
  });
});
