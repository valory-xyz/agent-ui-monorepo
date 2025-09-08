import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';
import { ConfigProvider as AntdConfigProvider } from 'antd';
import styled from 'styled-components';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { COLOR, THEME_CONFIG } from '../constants/theme';
import { Agent } from './agent';

const StyledApp = styled.div`
  min-height: 100vh;
  overflow: auto;
  background-color: ${COLOR.BACKGROUND};
  background-image: url('/images/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: ${COLOR.TEXT_PRIMARY};
  padding-bottom: 24px;
`;

export function App() {
  return (
    <>
      <StyledApp>
        <ErrorBoundary>
          <AntdConfigProvider theme={THEME_CONFIG}>
            <Agent />
          </AntdConfigProvider>
        </ErrorBoundary>
      </StyledApp>
      <GlobalStyles />
    </>
  );
}

export default App;
