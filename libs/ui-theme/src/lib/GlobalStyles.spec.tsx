import { renderToStaticMarkup } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';

import { GlobalStyles } from './GlobalStyles';

// ServerStyleSheet forces styled-components to evaluate the createGlobalStyle
// template (including the conditional `tooltipBorderColor` branch) so the
// inline function is counted by istanbul.
const collectCss = (element: React.ReactElement) => {
  const sheet = new ServerStyleSheet();
  try {
    renderToStaticMarkup(sheet.collectStyles(element));
    return sheet.getStyleTags();
  } finally {
    sheet.seal();
  }
};

describe('GlobalStyles', () => {
  it('renders base global CSS without tooltipBorderColor', () => {
    const css = collectCss(<GlobalStyles />);
    expect(css).toContain('font-family');
    expect(css).not.toContain('.ant-tooltip-inner');
  });

  it('renders tooltip border override when tooltipBorderColor is provided', () => {
    const css = collectCss(<GlobalStyles tooltipBorderColor="#ff00ff" />);
    expect(css).toContain('.ant-tooltip-inner');
    expect(css).toContain('#ff00ff');
  });
});
