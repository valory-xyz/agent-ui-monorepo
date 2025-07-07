import { Button, Flex, Input, Typography } from 'antd';

import { useCallback, useState } from 'react';
import { COLOR } from '../../constants/colors';
import { Address } from '@agent-ui-monorepo/util-constants-and-types';
// import { useWithdrawFunds } from './useWithdrawFunds';

const { Text } = Typography;

type WithdrawInvestedFundsProps = {
  onInitiateWithdrawal: (address: Address) => void;
};

export const WithdrawInvestedFunds = ({ onInitiateWithdrawal }: WithdrawInvestedFundsProps) => {
  // const { isLoading, data } = useWithdrawFunds();
  const [withdrawalAddress, setWithdrawalAddress] = useState('');

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawalAddress(e.target.value as Address);
  }, []);

  return (
    <>
      <Flex gap={4} vertical className="w-full">
        <Text type="secondary">Withdrawal address</Text>
        <Input
          value={withdrawalAddress || ''}
          onChange={handleAddressChange}
          placeholder="0x..."
          className="w-full"
        />
        <Text type="secondary">
          Ensure this is an EVM-compatible address you can access on all relevant chains.
        </Text>
      </Flex>

      <Button
        onClick={() => onInitiateWithdrawal(withdrawalAddress as Address)}
        disabled={!withdrawalAddress}
        type="primary"
        style={{ color: withdrawalAddress ? COLOR.black : undefined }}
      >
        Initiate withdrawal
      </Button>
    </>
  );
};
