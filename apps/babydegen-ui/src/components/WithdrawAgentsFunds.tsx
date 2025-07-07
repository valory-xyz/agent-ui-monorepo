import { Button, Card, Flex, Typography } from 'antd';

import { CardTitle } from '../ui/CardTitle';

const { Text } = Typography;

export const WithdrawAgentsFunds = () => (
  <Card className="card-border card-gradient">
    <Flex vertical justify="space-between" align="flex-start" gap={16}>
      <CardTitle text="Withdraw agents funds" />
      <Text type="secondary">
        Transfer all assets currently managed by your agent to your target address, converted to
        USDC. This action is recommended before initiating the withdrawal process on Pearl.
      </Text>
      <Button type="primary" style={{ color: 'black' }}>
        Withdraw
      </Button>
    </Flex>
  </Card>
);
