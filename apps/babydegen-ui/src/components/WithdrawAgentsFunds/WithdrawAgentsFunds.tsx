import { Button, Card, Flex, Typography } from 'antd';
import { useState } from 'react';

import { CardTitle } from '../../ui/CardTitle';
import { COLOR } from '../../constants/colors';
import { InitiateWithdrawal } from './InitiateWithdrawal';

const { Text } = Typography;

export const WithdrawAgentsFunds = () => {
  const [canInitiateWithdrawal, setCanInitiateWithdrawal] = useState(false);

  return (
    <Card className="card-gradient">
      <Flex vertical justify="space-between" align="flex-start" gap={24}>
        <Flex vertical gap={8}>
          <CardTitle
            text={canInitiateWithdrawal ? 'Withdraw invested funds' : 'Withdraw agents funds'}
          />
          <Text type="secondary">
            Transfer all assets currently managed by your agent to your target address, converted to
            USDC. This action is recommended before initiating the withdrawal process on Pearl.
          </Text>
        </Flex>

        {canInitiateWithdrawal ? (
          <InitiateWithdrawal />
        ) : (
          <Button
            onClick={() => setCanInitiateWithdrawal(true)}
            type="primary"
            style={{ color: COLOR.black }}
          >
            Withdraw
          </Button>
        )}
      </Flex>
    </Card>
  );
};
