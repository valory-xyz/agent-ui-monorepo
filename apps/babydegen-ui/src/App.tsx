import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';
import { App as AntdApp, Flex } from 'antd';

import { Allocation } from './components/Allocation/Allocation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Portfolio } from './components/Portfolio/Portfolio';
import { Strategy } from './components/Strategy/Strategy';
import { WithdrawAgentsFunds } from './components/WithdrawAgentsFunds/WithdrawAgentsFunds';

const App = () => {
  return (
    <ErrorBoundary>
      <AntdApp>
        <Flex
          vertical
          style={{ width: '100%', minHeight: '100vh', paddingBottom: 24, marginTop: 48 }}
          gap={24}
        >
          <Flex
            vertical
            gap={24}
            style={{ minWidth: '760px', maxWidth: '760px', margin: '0 auto' }}
          >
            <Portfolio />
            <Allocation />
            <Strategy />
            <WithdrawAgentsFunds />
          </Flex>
        </Flex>
        <GlobalStyles />
      </AntdApp>
    </ErrorBoundary>
  );
};

export default App;
