import { Button, Card, Flex, Input, Skeleton, Tooltip, Typography } from 'antd';

import { CardTitle } from '../ui/CardTitle';
import { useCallback, useState } from 'react';
import { COLOR } from '../constants/colors';
import { InfoCircleOutlined } from '@ant-design/icons';
import { NA } from '../constants/common';

const { Title, Text } = Typography;

// TODO: Ask agent team
const useFunds = () => {
  return { isLoading: false, data: 768.55 };
};

const WithdrawInvestedFunds = () => {
  const { isLoading, data } = useFunds();
  const [withdrawalAddress, setWithdrawalAddress] = useState('');

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawalAddress(e.target.value);
  }, []);

  return (
    <>
      <Flex vertical gap={8}>
        <Text type="secondary">
          Funds to withdraw
          <Tooltip title="TODO: Ask Roman">
            <InfoCircleOutlined style={{ marginLeft: 6 }} />
          </Tooltip>
        </Text>

        {isLoading ? (
          <Skeleton.Input />
        ) : (
          <Title level={3} className="m-0">
            {data ? `$${data.toFixed(2)} USDC` : NA}
          </Title>
        )}
      </Flex>

      <Flex gap={4} vertical className="w-full">
        <Text type="secondary">Withdrawal address</Text>
        <Input
          value={withdrawalAddress}
          onChange={handleAddressChange}
          placeholder="0x..."
          className="w-full"
        />
        <Text type="secondary">
          Ensure this is an EVM-compatible address you can access on all relevant chains.
        </Text>
      </Flex>

      <Button
        // onClick={() => setCanInitiateWithdrawal(true)}
        disabled={!withdrawalAddress}
        type="primary"
        style={{ color: withdrawalAddress ? COLOR.black : undefined }}
      >
        Initiate withdrawal
      </Button>
    </>
  );
};

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
