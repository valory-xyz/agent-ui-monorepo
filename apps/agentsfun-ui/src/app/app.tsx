import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';
import { Agent } from './agent';
import styled from 'styled-components';
import { COLOR } from '../constants/theme';

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
  background:
    linear-gradient(0deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.7) 100%),
    url(<path-to-image>) lightgray 50% / cover no-repeat;
  background-blend-mode: overlay, normal;
`;

export function App() {
  return (
    <>
      <StyledApp>
        <Agent />
      </StyledApp>

      {/* @ts-expect-error TODO */}
      <GlobalStyles />
    </>
  );
}

export default App;
