import { Flex, Typography } from 'antd';
import { FC, ReactNode } from 'react';

const { Text } = Typography;

type EmptyStateProps = { logo: string; message: string | ReactNode };

export const EmptyState: FC<EmptyStateProps> = ({ logo, message }) => (
  <Flex justify="center" align="center" style={{ height: 200, width: '100%' }}>
    <Flex justify="center" align="center" vertical gap={24} style={{ maxWidth: 340 }}>
      <img src={logo} alt="No recent activity" style={{ width: 40, height: 40 }} />
      <Text type="secondary" className="text-center">
        {message}
      </Text>
    </Flex>
  </Flex>
);
