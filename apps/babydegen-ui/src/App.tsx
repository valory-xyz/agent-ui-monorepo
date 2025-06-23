import { Flex } from 'antd';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import { GlobalStyles } from '@agent-ui-monorepo/ui-theme';

import { Allocation } from './components/Allocation/Allocation';
import { Chat } from './components/Chat/Chat';
import { UnlockChat } from './components/Chat/UnlockChat';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Portfolio } from './components/Portfolio/Portfolio';
import { Strategy } from './components/Strategy/Strategy';
import { useFeatures } from './hooks/useFeatures';
import { usePortfolio } from './hooks/usePortfolio';
import { agentType } from './utils/agentMap';

function App() {
  const { isLoading, data } = useFeatures();
  const { isLoading: isPortfolioLoading, data: portfolio } = usePortfolio();

  return (
    <ErrorBoundary>
      <Flex vertical style={{ width: '100%', minHeight: '100vh', paddingBottom: 24 }} gap={24}>
        <Navbar
          isLoading={isPortfolioLoading}
          agentType={agentType}
          userAddress={portfolio?.address}
        />
        <Flex vertical gap={24} style={{ minWidth: '760px', maxWidth: '760px', margin: '0 auto' }}>
          <Portfolio />
          <Allocation />
          {!isLoading && (
            <>
              {data?.isChatEnabled ? (
                <>
                  <Strategy />
                  <Chat />
                </>
              ) : (
                <UnlockChat />
              )}
            </>
          )}
        </Flex>
      </Flex>
      <GlobalStyles />
    </ErrorBoundary>
  );
}

export default App;
