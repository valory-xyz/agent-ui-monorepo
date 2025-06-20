import errorLogo from '../../assets/error.png';
import { Flex, Typography } from 'antd';

const { Text } = Typography;

export const ErrorState = ({ message }: { message: string }) => (
  <Flex justify="center" align="center" style={{ height: 200, width: '100%' }}>
    <Flex justify="center" align="center" vertical gap={16} style={{ maxWidth: 340 }}>
      <img src={errorLogo} alt="Error loading activity" style={{ width: 40, height: 40 }} />
      <Text type="secondary" className="text-center">
        {message}
      </Text>
    </Flex>
  </Flex>
);
