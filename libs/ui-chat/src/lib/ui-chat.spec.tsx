import { render } from '@testing-library/react';

import UiChat from './ui-chat';

describe('UiChat', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiChat />);
    expect(baseElement).toBeTruthy();
  });
});
