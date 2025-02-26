import { Flex } from 'antd';
import React from 'react';

import AllocationCard from './components/allocation/AllocationCard';
import { Chat } from './components/Chat/Chat';
import Navbar from './components/navbar/Navbar';
import PortfolioCard from './components/portfolio/PortfolioCard';
import { Strategy } from './components/Strategy/Strategy';

function App() {
  return (
    <Flex vertical style={{ width: '100%', minHeight: '100vh' }} gap={24}>
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
