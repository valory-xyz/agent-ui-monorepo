import { App as AntdApp, Card, Flex } from 'antd';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';
import { UnlockChat } from '@agent-ui-monorepo/ui-chat';

import { Allocation } from './components/Allocation/Allocation';
import { Chat } from './components/Chat/Chat';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Portfolio } from './components/Portfolio/Portfolio';
import { Strategy } from './components/Strategy/Strategy';
import { useFeatures } from './hooks/useFeatures';
import { usePortfolio } from './hooks/usePortfolio';
import { agentType } from './utils/agentMap';
import { WithdrawAgentsFunds } from './components/WithdrawAgentsFunds/WithdrawAgentsFunds';

const StrategyAndChat = () => {
  const { isLoading, data } = useFeatures();

  if (isLoading) return;

  if (!data?.isChatEnabled) {
    return (
      <Card className="card-gradient">
        <UnlockChat type="secondary" />;
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
  const { isLoading: isPortfolioLoading, data: portfolio } = usePortfolio();

  return (
    <ErrorBoundary>
      <AntdApp>
        <Flex vertical style={{ width: '100%', minHeight: '100vh', paddingBottom: 24 }} gap={24}>
          <Navbar
            isLoading={isPortfolioLoading}
            agentType={agentType}
            userAddress={portfolio?.address}
          />
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
