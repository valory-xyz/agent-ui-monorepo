import { Card, Flex, Typography } from 'antd';
import React from 'react';

import { AllocationPie } from './AllocationPie';
import { AllocationTable } from './AllocationTable';

const AllocationTitle = () => (
  <Typography.Title level={4}>Allocation</Typography.Title>
);

export default function AllocationCard() {
  return (
    <Card className="card-gradient">
      <AllocationTitle />
      <Flex style={{ justifyContent: 'space-between' }} gap={24}>
        <AllocationTable />
        <AllocationPie />
      </Flex>
    </Card>
  );
}
