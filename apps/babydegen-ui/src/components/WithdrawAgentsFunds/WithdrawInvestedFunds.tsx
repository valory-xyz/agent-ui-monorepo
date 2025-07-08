import { Button, Flex, Input, Typography } from 'antd';

import { COLOR } from '../../constants/colors';
import { Address } from '@agent-ui-monorepo/util-constants-and-types';
// import { useWithdrawFunds } from './useWithdrawFunds';

const { Text } = Typography;

type WithdrawInvestedFundsProps = {
  isLoading: boolean;
  onInitiateWithdrawal: (address: Address) => void;
  withdrawalAddress: string;
  onAddressChange: (address: Address) => void;
};

export const WithdrawInvestedFunds = ({
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
      onClick={() => onInitiateWithdrawal(withdrawalAddress as Address)}
      type="primary"
      style={{ color: withdrawalAddress ? COLOR.black : undefined }}
    >
      Initiate withdrawal
    </Button>
  </>
);
