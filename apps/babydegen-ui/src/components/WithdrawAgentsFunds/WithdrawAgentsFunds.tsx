import { Alert, App, Button, Card, Flex, Skeleton, Spin, Tooltip, Typography } from 'antd';
import { Address, UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';
import { isAddress } from 'viem';

import { CardTitle } from '../../ui/CardTitle';
import { useCallback, useState } from 'react';
import { COLOR } from '../../constants/colors';
import { ExclamationCircleFilled, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { NA } from '../../constants/common';
import { useWithdrawFunds } from './useWithdrawFunds';
import { useFunds } from './useFunds';
import { WithdrawInvestedFunds } from './WithdrawInvestedFunds';

const { Title, Text, Link } = Typography;

const WithdrawLoading = ({ text }: { text: string }) => (
  <Flex gap={8}>
    <Spin indicator={<LoadingOutlined style={{ color: COLOR.black }} spin />} />
    <Text type="secondary">{text}</Text>
  </Flex>
);

const WithdrawSuccess = ({ href }: { href: string | null }) => (
  <Alert
    message={
      <Flex gap={8} className="w-full">
        <Text type="secondary">Withdrawal complete!</Text>
        {href && (
          <Link href={href} target="_blank" rel="noopener noreferrer" className="underline">
            Transaction details {UNICODE_SYMBOLS.EXTERNAL_LINK}
          </Link>
        )}
      </Flex>
    }
    type="success"
    showIcon
    className="w-full"
    style={{ background: COLOR.white, borderColor: COLOR.lightGrey }}
  />
);

type WithdrawalFailedProps = {
  isLoading: boolean;
  href?: string | null;
  onRetry: () => void;
};

const WithdrawFailed = ({ isLoading, href, onRetry }: WithdrawalFailedProps) => (
  <Alert
    message={
      <Flex vertical gap={8} align="flex-start" className="w-full">
        <Flex gap={8} className="w-full" align="center">
          <ExclamationCircleFilled style={{ color: COLOR.danger, fontSize: 20 }} />
          <Text type="secondary">Withdrawal failed due to error!</Text>
          {href && (
            <Link href={href} target="_blank" rel="noopener noreferrer" className="underline">
              Transaction details {UNICODE_SYMBOLS.EXTERNAL_LINK}
            </Link>
          )}
        </Flex>

        <Button
          loading={isLoading}
          onClick={onRetry}
          type="primary"
          style={{ color: COLOR.black, marginLeft: 32 }}
        >
          Retry
        </Button>
      </Flex>
    }
    type="error"
    className="w-full"
    style={{ background: COLOR.white, borderColor: COLOR.lightGrey }}
  />
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
  const { message } = App.useApp();
  const [withdrawalAddress, setWithdrawalAddress] = useState('');

  const { isLoading, initiateWithdraw, isError, data: withdrawDetails } = useWithdrawFunds();

  const handleAddressChange = useCallback((address: Address) => {
    setWithdrawalAddress(address);
  }, []);

  const handleInitiateWithdrawal = useCallback(() => {
    if (!isAddress(withdrawalAddress)) {
      message.error('Please enter a valid address.');
      return;
    }

    initiateWithdraw(withdrawalAddress as Address);
  }, [initiateWithdraw, message, withdrawalAddress]);

  if (isError || withdrawDetails?.status === 'failed') {
    return (
      <WithdrawFailed
        isLoading={isLoading}
        onRetry={handleInitiateWithdrawal}
        href={withdrawDetails?.transaction_link}
      />
    );
  }

  if (withdrawDetails?.status === 'completed') {
    return <WithdrawSuccess href={withdrawDetails.transaction_link} />;
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
      <WithdrawInvestedFunds
        isLoading={isLoading}
        withdrawalAddress={withdrawalAddress}
        onAddressChange={handleAddressChange}
        onInitiateWithdrawal={handleInitiateWithdrawal}
      />
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
