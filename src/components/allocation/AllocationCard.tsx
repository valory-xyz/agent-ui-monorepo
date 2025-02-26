import { Card, Flex } from 'antd';
import React from 'react';

import { CardTitle } from '../../ui/CardTitle';
import { AllocationPie } from './AllocationPie';
import { AllocationTable } from './AllocationTable';

export default function AllocationCard() {
  return (
    <Card className="card-gradient">
      <CardTitle text="Allocation" />
      <Flex
        style={{ justifyContent: 'space-between', alignItems: 'center' }}
        gap={24}
      >
        <AllocationTable />
        <AllocationPie />
      </Flex>
    </Card>
  );
}
