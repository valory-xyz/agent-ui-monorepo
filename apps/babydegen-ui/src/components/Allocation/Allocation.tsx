import { Card, Flex } from 'antd';

import { CardTitle } from '../../ui/CardTitle';
import { AllocationPie } from './AllocationPie';
import { AllocationTable } from './AllocationTable';

export const Allocation = () => (
  <Card className="card-gradient">
    <CardTitle text="Allocation" />
    <Flex justify="space-between" align="center" gap={24}>
      <AllocationTable />
      <AllocationPie />
    </Flex>
  </Card>
);
