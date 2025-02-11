import { Flex } from 'antd';
import React from 'react';

import AllocationCard from './components/allocation/AllocationCard';
import Navbar from './components/navbar/Navbar';
import PortfolioCard from './components/portfolio/PortfolioCard';

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
      </Flex>
    </Flex>
  );
}

console.log(process.env.REACT_APP_UI_PORT);

export default App;
