import { render } from '@testing-library/react';

import UiPill from './ui-pill';

describe('UiPill', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiPill />);
    expect(baseElement).toBeTruthy();
  });
});
