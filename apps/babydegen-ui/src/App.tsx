import { UnlockChat } from '@agent-ui-monorepo/ui-chat';
import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';
import { App as AntdApp, Card, Flex } from 'antd';

import { Allocation } from './components/Allocation/Allocation';
import { Chat } from './components/Chat/Chat';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Portfolio } from './components/Portfolio/Portfolio';
import { Strategy } from './components/Strategy/Strategy';
import { WithdrawAgentsFunds } from './components/WithdrawAgentsFunds/WithdrawAgentsFunds';
import { useFeatures } from './hooks/useFeatures';

const StrategyAndChat = () => {
  const { isLoading, data } = useFeatures();

  if (isLoading) return;

  if (!data?.isChatEnabled) {
    return (
      <Card className="card-gradient">
        <UnlockChat type="secondary" />
      </Card>
    );
  }

  return (
    <>
      <Strategy />
      <Chat />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AntdApp>
        <Flex vertical style={{ width: '100%', minHeight: '100vh', paddingBottom: 24, marginTop: 48 }} gap={24}>
          <Flex
            vertical
            gap={24}
            style={{ minWidth: '760px', maxWidth: '760px', margin: '0 auto' }}
          >
            <Portfolio />
            <Allocation />
            <StrategyAndChat />
            <WithdrawAgentsFunds />
          </Flex>
        </Flex>
        <GlobalStyles />
      </AntdApp>
    </ErrorBoundary>
  );
};

export default App;
