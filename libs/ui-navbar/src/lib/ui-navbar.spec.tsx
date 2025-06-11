import { render } from '@testing-library/react';

import UiNavbar from './ui-navbar';

describe('UiNavbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiNavbar />);
    expect(baseElement).toBeTruthy();
  });
});
