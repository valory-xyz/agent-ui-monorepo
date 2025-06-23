import { render } from '@testing-library/react';

import { GlobalStyles } from './GlobalStyles';

describe('GlobalStyles', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GlobalStyles />);
    expect(baseElement).toBeTruthy();
  });
});
