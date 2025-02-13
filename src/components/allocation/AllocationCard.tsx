import { Card, Flex, Typography } from 'antd';
import React from 'react';

import { AllocationPie } from './AllocationPie';
import { AllocationTable } from './AllocationTable';

const AllocationTitle = () => (
  <Typography.Title level={4} type="secondary">
    Allocation
  </Typography.Title>
);

export default function AllocationCard() {
  return (
    <Card className="card-gradient">
      <AllocationTitle />
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
