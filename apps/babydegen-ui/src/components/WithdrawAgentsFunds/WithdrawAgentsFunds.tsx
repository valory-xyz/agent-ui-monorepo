import { Alert, Button, Card, Flex, Skeleton, Spin, Tooltip, Typography } from 'antd';
import { Address, UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';

import { CardTitle } from '../../ui/CardTitle';
import { useCallback, useState } from 'react';
import { COLOR } from '../../constants/colors';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { NA } from '../../constants/common';
import { WithdrawInvestedFunds } from './WithdrawInvestedFunds';
import { useWithdrawFunds } from './useWithdrawFunds';
import { useFunds } from './useFunds';

const { Title, Text, Link } = Typography;

const WithdrawSuccess = ({ href }: { href: string }) => (
  <Alert
    message={
      <Flex gap={8} className="w-full">
        <Text type="secondary">Withdrawal complete!</Text>
        <Link href={href} target="_blank" rel="noopener noreferrer" className="underline">
          Transaction details {UNICODE_SYMBOLS.EXTERNAL_LINK}
        </Link>
      </Flex>
    }
    type="success"
    showIcon
    className="w-full"
    style={{ background: COLOR.white, borderColor: COLOR.lightGrey }}
  />
);

const WithdrawLoading = ({ text }: { text: string }) => (
  <Flex gap={8}>
    <Spin indicator={<LoadingOutlined style={{ color: COLOR.black }} spin />} />
    <Text type="secondary">{text}</Text>
  </Flex>
);

const FundsToWithdraw = () => {
  const { isLoading, data } = useFunds();

  return (
    <Flex vertical gap={8}>
      <Text type="secondary">
        Funds to withdraw
        <Tooltip title="Calculated by converting all active positions into USDC at current market rates. Final value may differ slightly at withdrawal.">
          <InfoCircleOutlined style={{ marginLeft: 6 }} />
        </Tooltip>
      </Text>

      {isLoading ? (
        <Skeleton.Input />
      ) : (
        <Title level={3} className="m-0">
          {data ? `$${data.total_value_usd.toFixed(2)} USDC` : NA}
        </Title>
      )}
    </Flex>
  );
};

const ShowFundsAndInitialWithdraw = () => {
  const { data: withdrawDetails } = useWithdrawFunds();

  const handleInitiateWithdrawal = useCallback((address: Address) => {
    console.log('Initiating withdrawal to:', address);
  }, []);

  if (withdrawDetails?.isComplete) {
    return <WithdrawSuccess href={withdrawDetails.txnLink} />;
  }

  if (withdrawDetails?.message) {
    return (
      <>
        <FundsToWithdraw />
        <WithdrawLoading text={withdrawDetails.message} />
      </>
    );
  }

  return (
    <>
      <FundsToWithdraw />
      <WithdrawInvestedFunds onInitiateWithdrawal={handleInitiateWithdrawal} />
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
          <ShowFundsAndInitialWithdraw />
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
