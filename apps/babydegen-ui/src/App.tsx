import { Flex } from 'antd';
import React from 'react';

import { Allocation } from './components/Allocation/Allocation';
import { Chat } from './components/Chat/Chat';
import { UnlockChat } from './components/Chat/UnlockChat';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Portfolio } from './components/Portfolio/Portfolio';
import { Strategy } from './components/Strategy/Strategy';
import { useFeatures } from './hooks/useFeatures';

function App() {
  const { isLoading, data } = useFeatures();

  return (
    <ErrorBoundary>
      <Flex
        vertical
        style={{ width: '100%', minHeight: '100vh', paddingBottom: 24 }}
        gap={24}
      >
        <Navbar />
        <Flex
          vertical
          gap={24}
          style={{ minWidth: '760px', maxWidth: '760px', margin: '0 auto' }}
        >
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
    </ErrorBoundary>
  );
}

export default App;
