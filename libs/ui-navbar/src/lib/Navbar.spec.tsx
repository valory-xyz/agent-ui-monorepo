import { render } from '@testing-library/react';

import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Navbar agentType="modius" userAddress="Modius User" />);
    expect(baseElement).toBeTruthy();
  });
});
