import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';
import { Agent } from './agent';
import styled from 'styled-components';

const StyledApp = styled.div`
  min-height: 100vh;
  overflow: auto;
  background:
    radial-gradient(50% 50% at 50% 50%, #fff 0%, rgba(255, 255, 255, 0) 60.1%),
    conic-gradient(
      from 0deg at 50% 50%,
      #f6f4ff 0deg,
      #f2e6ff 47.35224366188049deg,
      #fef6f1 131.9663679599762deg,
      #f9eaf0 224.68472242355347deg,
      #f0fef7 266.5582752227783deg,
      #eefafd 316.8729758262634deg,
      #f6f4ff 360deg
    );
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
