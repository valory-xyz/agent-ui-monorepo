import { Flex } from 'antd';
import React from 'react';

import AllocationCard from './components/Allocation/AllocationCard';
import { Chat } from './components/Chat/Chat';
import Navbar from './components/Navbar';
import PortfolioCard from './components/Portfolio/PortfolioCard';
import { Strategy } from './components/Strategy/Strategy';

function App() {
  return (
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
        <PortfolioCard />
        <AllocationCard />
        <Strategy />
        <Chat />
      </Flex>
    </Flex>
  );
}

export default App;
