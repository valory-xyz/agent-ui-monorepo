import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';

import { Flex } from 'antd';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import { ConfigProvider } from 'antd';
import styled from 'styled-components';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { Persona } from '../components/Persona';
import { THEME_CONFIG } from '../constants/theme';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import { NavBarContainer } from '../components/ui/NavBarContainer';

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

const AgentContent = styled(Flex)`
  gap: 24px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

const Agent = () => {
  const { data, isLoading } = useAgentDetails();

  return (
    <Flex vertical gap={24}>
      <NavBarContainer>
        <Navbar agentType="agentsFun" isLoading={isLoading} userAddress={data?.address} />
      </NavBarContainer>
      <AgentContent vertical>
        <Persona />
      </AgentContent>
    </Flex>
  );
};

export function App() {
  return (
    <>
      <StyledApp>
        <ErrorBoundary>
          <ConfigProvider theme={THEME_CONFIG}>
            <Agent />
          </ConfigProvider>
        </ErrorBoundary>
      </StyledApp>
      <GlobalStyles />
    </>
  );
}

export default App;
