import { Flex, Skeleton } from 'antd';

import { Card } from '../ui/Card';

export const LoaderCard = () => {
  return (
    <Card>
      <Flex gap={24}>
        <Skeleton.Avatar size={128} active />
        <Flex vertical gap={8}>
          <Skeleton.Input active className="mb-8" />
          <Skeleton.Input active size="small" />
          <Skeleton.Input active />
        </Flex>
      </Flex>
    </Card>
  );
};
