import { Flex } from 'antd';
import React from 'react';

import { Allocation } from './components/Allocation/Allocation';
import { Chat } from './components/Chat/Chat';
import { Navbar } from './components/Navbar';
import { Portfolio } from './components/PortfolioDetails/Portfolio';
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
        <Portfolio />
        <Allocation />
        <Strategy />
        <Chat />
      </Flex>
    </Flex>
  );
}

export default App;
