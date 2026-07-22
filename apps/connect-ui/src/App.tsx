import { ErrorBoundary } from '@agent-ui-monorepo/ui-error-boundary';
import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';
import { App as AntdApp, Divider, Flex, Spin } from 'antd';
import styled from 'styled-components';

import { CodingTool } from './components/CodingTool/CodingTool';
import { GetStarted } from './components/GetStarted/GetStarted';
import { TransactionMode } from './components/TransactionMode/TransactionMode';
import { WhitelistedAddresses } from './components/WhitelistedAddresses/WhitelistedAddresses';
import { COLOR } from './constants/theme';
import { useSettings } from './hooks/useSettings';
import { GlobalStyles as ConnectGlobalStyles } from './ui/GlobalStyles';

const Panel = styled.div`
  flex: 1;
  background-color: white;
  border-left: 1px solid ${COLOR.BORDER};
  border-right: 1px solid ${COLOR.BORDER};
`;

const Profile = () => {
  const { data } = useSettings();

  if (!data) {
    return (
      <Flex justify="center" style={{ padding: 48 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <>
      <GetStarted />
      <Divider style={{ margin: 0 }} />
      <CodingTool settings={data} />
      <Divider style={{ margin: 0 }} />
      <TransactionMode settings={data} />
      {data.protected.mode === 'restricted' && (
        <>
          <Divider style={{ margin: 0 }} />
          <WhitelistedAddresses />
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AntdApp>
        <Flex vertical style={{ minHeight: '100vh', maxWidth: '760px', margin: '0 auto' }}>
          <Panel>
            <Profile />
          </Panel>
        </Flex>
        <GlobalStyles />
        <ConnectGlobalStyles />
      </AntdApp>
    </ErrorBoundary>
  );
};

export default App;
