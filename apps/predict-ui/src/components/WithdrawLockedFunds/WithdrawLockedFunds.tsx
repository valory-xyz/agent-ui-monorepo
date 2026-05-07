import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert as AntdAlert, Button, Flex, Spin, Tooltip, Typography } from 'antd';
import { Info, TriangleAlert, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';
import { useWithdrawLockedFunds } from '../../hooks/useWithdrawLockedFunds';
import { Card } from '../ui/Card';

const { Title, Text } = Typography;

const POSITIONS_TOOLTIP =
  'Estimated value of all open positions at current market prices. Final value may differ at withdrawal.';

const InitiateButton = styled(Button)`
  align-self: flex-start;
  height: auto;
  padding: 8px 16px;
  border-radius: 10px;
  background: ${COLOR.WHITE_TRANSPARENT_10};
  border-color: transparent;
  color: ${COLOR.TEXT_PRIMARY};

  &:hover,
  &:focus {
    background: ${COLOR.WHITE_TRANSPARENT_20} !important;
    border-color: transparent !important;
    color: ${COLOR.TEXT_PRIMARY} !important;
  }
`;

const SuccessAlert = styled(AntdAlert)`
  background: ${COLOR.GREEN_BACKGROUND};
  border-color: ${COLOR.GREEN_BACKGROUND};
  align-items: flex-start;
  padding: 16px;
  .ant-alert-message,
  .ant-alert-description {
    color: ${COLOR.GREEN};
  }
`;

const ErrorAlert = styled(AntdAlert)`
  background: ${COLOR.RED_BACKGROUND};
  border-color: ${COLOR.RED_BACKGROUND};
  align-items: center;
  padding: 12px 16px;
  .ant-alert-message {
    color: ${COLOR.RED};
    margin-bottom: 0;
  }
`;

const WarningAlert = styled(AntdAlert)`
  background: ${COLOR.YELLOW_BACKGROUND};
  border-color: ${COLOR.YELLOW_BACKGROUND};
  align-items: flex-start;
  padding: 16px;
  .ant-alert-message,
  .ant-alert-description {
    color: ${COLOR.YELLOW};
  }
`;

const Header = ({ marketName }: { marketName: string }) => (
  <Flex vertical gap={6}>
    <Title level={4} className="m-0 font-normal">
      Withdraw funds locked in markets
    </Title>
    <Text type="secondary">
      Closes all open positions on {marketName} and returns the funds to your agent wallet. Required
      to fully withdraw your funds from the agent.
    </Text>
  </Flex>
);

const OpenPositionsValue = ({ amount }: { amount: number }) => (
  <Flex vertical gap={6}>
    <Flex align="center" gap={6}>
      <Text type="secondary">Open positions value</Text>
      <Tooltip title={POSITIONS_TOOLTIP}>
        <InfoCircleOutlined style={{ color: COLOR.SECONDARY }} />
      </Tooltip>
    </Flex>
    <Title level={4} className="m-0 font-normal">
      ~${amount.toFixed(2)}
    </Title>
  </Flex>
);

type InitiateProps = {
  amount: number;
  isLoading: boolean;
  onInitiate: () => void;
};

const InitiateBody = ({ amount, isLoading, onInitiate }: InitiateProps) => (
  <>
    <OpenPositionsValue amount={amount} />
    <InitiateButton onClick={onInitiate} loading={isLoading} disabled={amount <= 0}>
      Initiate withdrawal
    </InitiateButton>
  </>
);

const SELLING_MESSAGE: Record<'armed' | 'selling', string> = {
  armed: 'Withdrawal requested. Waiting for the agent to complete its current actions...',
  selling: 'Withdrawal initiated. Selling open positions...',
};

type SellingProps = {
  amount: number;
  mode: 'armed' | 'selling';
};

const SellingBody = ({ amount, mode }: SellingProps) => (
  <>
    <OpenPositionsValue amount={amount} />
    <Flex gap={8} align="center">
      <Spin indicator={<LoadingOutlined spin style={{ color: COLOR.TEXT_PRIMARY }} />} />
      <Text type="secondary">{SELLING_MESSAGE[mode]}</Text>
    </Flex>
  </>
);

const DoneBody = ({ marketName, onDismiss }: { marketName: string; onDismiss: () => void }) => (
  <SuccessAlert
    icon={<Info size={16} color={COLOR.GREEN} />}
    showIcon
    closable
    closeIcon={<X size={16} color={COLOR.GREEN} />}
    onClose={onDismiss}
    message={<span style={{ fontWeight: 500 }}>Withdrawal complete!</span>}
    description={
      <span style={{ display: 'inline-block', maxWidth: 470 }}>
        {marketName} positions have been sold, and funds are now in your Agent Wallet in Pearl. The
        agent has stopped trading and will continue when restarted.
      </span>
    }
  />
);

type PartialBodyProps = {
  amount: number;
  isLoading: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

const PartialBody = ({ amount, isLoading, onRetry, onDismiss }: PartialBodyProps) => (
  <>
    <WarningAlert
      icon={<TriangleAlert size={16} color={COLOR.YELLOW} />}
      showIcon
      closable
      closeIcon={<X size={16} color={COLOR.YELLOW} />}
      onClose={onDismiss}
      message={<span style={{ fontWeight: 500 }}>Partial withdrawal completed</span>}
      description={
        <span style={{ display: 'inline-block', maxWidth: 470 }}>
          Some positions couldn&apos;t be sold. Please try again to withdraw the remaining funds.
        </span>
      }
    />
    <OpenPositionsValue amount={amount} />
    <InitiateButton onClick={onRetry} loading={isLoading} disabled={amount <= 0}>
      Initiate withdrawal
    </InitiateButton>
  </>
);

type ErrorBodyProps = {
  amount: number;
  isLoading: boolean;
  positionsStuck: number;
  onRetry: () => void;
  onDismiss: () => void;
};

const ErrorBody = ({ amount, isLoading, positionsStuck, onRetry, onDismiss }: ErrorBodyProps) => (
  <>
    <ErrorAlert
      icon={<TriangleAlert size={16} color={COLOR.RED} />}
      showIcon
      closable
      closeIcon={<X size={16} color={COLOR.SECONDARY} />}
      onClose={onDismiss}
      message={
        <Flex gap={8} align="center">
          <span style={{ fontWeight: 500 }}>Withdrawal failed</span>
          {positionsStuck > 0 && (
            <Text style={{ color: COLOR.SECONDARY, fontSize: 14 }}>
              {positionsStuck} {positionsStuck === 1 ? 'position' : 'positions'} stuck
            </Text>
          )}
        </Flex>
      }
    />
    <OpenPositionsValue amount={amount} />
    <InitiateButton onClick={onRetry} loading={isLoading} disabled={amount <= 0}>
      Initiate withdrawal
    </InitiateButton>
  </>
);

type WithdrawLockedFundsProps = {
  /** Estimated USD value of currently locked positions. */
  lockedAmount: number;
  /** Display name of the prediction market the agent trades on (e.g. "Polymarket"). */
  marketName: string;
};

export const WithdrawLockedFunds = ({ lockedAmount, marketName }: WithdrawLockedFundsProps) => {
  const { isLoading, isError, data, initiateWithdraw } = useWithdrawLockedFunds();
  const [isResultDismissed, setIsResultDismissed] = useState(false);

  const handleInitiate = useCallback(async () => {
    setIsResultDismissed(false);
    try {
      await initiateWithdraw();
    } catch {
      // surfaced via isError; intentionally swallowed to keep the UI in error state
    }
  }, [initiateWithdraw]);

  const handleDismiss = useCallback(() => {
    setIsResultDismissed(true);
  }, []);

  const renderBody = () => {
    const mode = data?.mode;
    // A partial sweep ends in mode=errored but with at least one filled position.
    // The UX is reframed as "completed with caveats" rather than a hard failure.
    const isPartial = mode === 'errored' && (data?.fills.length ?? 0) > 0;

    if (!isResultDismissed) {
      if (mode === 'complete') {
        return <DoneBody marketName={marketName} onDismiss={handleDismiss} />;
      }
      if (isPartial) {
        return (
          <PartialBody
            amount={lockedAmount}
            isLoading={isLoading}
            onRetry={handleInitiate}
            onDismiss={handleDismiss}
          />
        );
      }
      if (mode === 'errored' || isError) {
        return (
          <ErrorBody
            amount={lockedAmount}
            isLoading={isLoading}
            positionsStuck={data?.positions_stuck ?? 0}
            onRetry={handleInitiate}
            onDismiss={handleDismiss}
          />
        );
      }
    }
    if (mode === 'armed' || mode === 'selling') {
      return <SellingBody amount={lockedAmount} mode={mode} />;
    }
    return <InitiateBody amount={lockedAmount} isLoading={isLoading} onInitiate={handleInitiate} />;
  };

  return (
    <Card $gap="24px">
      <Header marketName={marketName} />
      {renderBody()}
    </Card>
  );
};
