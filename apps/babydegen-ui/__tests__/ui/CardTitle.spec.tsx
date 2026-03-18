import { render, screen } from '@testing-library/react';

import { CardTitle } from '../../src/ui/CardTitle';

describe('CardTitle', () => {
  it('renders the text prop', () => {
    render(<CardTitle text="My Title" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders ReactNode text prop', () => {
    render(<CardTitle text={<span>Node Title</span>} />);
    expect(screen.getByText('Node Title')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => render(<CardTitle text="Test" />)).not.toThrow();
  });
});
