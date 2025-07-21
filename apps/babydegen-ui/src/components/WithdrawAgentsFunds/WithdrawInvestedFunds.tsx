import { Alert, App, Button, Flex, Skeleton, Spin, Tooltip, Typography, Input } from 'antd';
import { Address, UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';
import { isAddress } from 'viem';
import { ExclamationCircleFilled, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';

import { COLOR } from '../../constants/colors';
import { NA } from '../../constants/common';
import { useWithdrawFunds } from './useWithdrawFunds';
import { useFunds } from './useFunds';

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

type WithdrawInvestedFundsProps = {
  isLoading: boolean;
  onInitiateWithdrawal: () => void;
  withdrawalAddress: string;
  onAddressChange: (address: Address) => void;
};

const InitiateWithdrawal = ({
  isLoading,
  onInitiateWithdrawal,
  withdrawalAddress,
  onAddressChange = () => null,
}: WithdrawInvestedFundsProps) => (
  <>
    <Flex gap={4} vertical className="w-full">
      <Text type="secondary">Withdrawal address</Text>
      <Input
        value={withdrawalAddress || ''}
        onChange={(e) => onAddressChange(e.target.value as Address)}
        placeholder="0x..."
        className="w-full"
      />
      <Text type="secondary">
        Ensure this is an EVM-compatible address you can access on all relevant chains.
      </Text>
    </Flex>

    <Button
      disabled={!withdrawalAddress}
      loading={isLoading}
      onClick={() => onInitiateWithdrawal()}
      type="primary"
      style={{ color: withdrawalAddress ? COLOR.black : undefined }}
    >
      Initiate withdrawal
    </Button>
  </>
);

export const WithdrawInvestedFunds = () => {
  const { message } = App.useApp();
  const { isLoading, initiateWithdraw, isError, data: withdrawDetails } = useWithdrawFunds();
  const [withdrawalAddress, setWithdrawalAddress] = useState('');

  const handleAddressChange = useCallback((address: Address) => {
    setWithdrawalAddress(address);
  }, []);

  const handleInitiateWithdrawal = useCallback(async () => {
    if (!isAddress(withdrawalAddress)) {
      message.error('Please enter a valid address.');
      return;
    }

    window.console.log('Initiating withdrawal for address:', withdrawalAddress);
    await initiateWithdraw(withdrawalAddress as Address);
  }, [initiateWithdraw, message, withdrawalAddress]);

  if (isError || withdrawDetails?.status === 'failed') {
    return (
      <WithdrawFailed
        isLoading={isLoading}
        href={withdrawDetails?.transaction_link}
        onRetry={handleInitiateWithdrawal}
      />
    );
  }

  if (withdrawDetails?.status === 'completed') {
    return <WithdrawSuccess href={withdrawDetails.transaction_link} />;
  }

  if (withdrawDetails?.status === 'initiated') {
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
      <InitiateWithdrawal
        isLoading={isLoading}
        withdrawalAddress={withdrawalAddress}
        onAddressChange={handleAddressChange}
        onInitiateWithdrawal={handleInitiateWithdrawal}
      />
    </>
  );
};
