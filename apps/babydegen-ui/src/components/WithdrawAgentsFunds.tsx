import { Button, Card, Flex, Typography } from 'antd';

import { CardTitle } from '../ui/CardTitle';
import { useState } from 'react';
import { COLOR } from '../constants/colors';

const { Text } = Typography;

export const WithdrawInvestedFunds = () => <>TODO</>;

export const WithdrawAgentsFunds = () => {
  const [canInitiateWithdrawal, setCanInitiateWithdrawal] = useState(false);

  return (
    <Card className="card-gradient">
      <Flex vertical justify="space-between" align="flex-start" gap={16}>
        <CardTitle
          text={canInitiateWithdrawal ? 'Withdraw agents funds' : 'Withdraw invested funds'}
        />
        <Text type="secondary">
          Transfer all assets currently managed by your agent to your target address, converted to
          USDC. This action is recommended before initiating the withdrawal process on Pearl.
        </Text>

        {canInitiateWithdrawal ? (
          <WithdrawInvestedFunds />
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
