import { ArrowRightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import React, { CSSProperties, ReactNode, useCallback } from 'react';

import { COLOR } from '../../constants/colors';
import {
  protocolImageMap,
  protocolMap,
  tradingTypeMap,
} from '../../constants/textMaps';
import { SelectedProtocol, TradingType } from '../../types';
import { Pill } from '../../ui/Pill';

const { Text } = Typography;

const SystemContainerStyles: CSSProperties = {
  marginTop: 0,
  width: '100%',
  backgroundColor: COLOR.lightGrey,
  padding: '8px 16px',
  borderRadius: 8,
};

type SystemMessageProps = { label: string; children: ReactNode };
const SystemMessage = ({ label, children }: SystemMessageProps) => {
  return (
    <Flex align="center" gap={12} style={SystemContainerStyles}>
      <Text type="secondary">{label}</Text>
      {children}
    </Flex>
  );
};

type TradingStrategyProps = { from: TradingType; to: TradingType };

export const TradingStrategy = ({ from, to }: TradingStrategyProps) => {
  const getType = useCallback((type: TradingType) => {
    if (type === 'balanced') return 'primary';
    if (type === 'risky') return 'danger';
    return undefined;
  }, []);

  return (
    <SystemMessage label="Trading strategy updated:">
      <Pill type={getType(from)} size="large" style={{ marginLeft: 0 }}>
        {tradingTypeMap[from]}
      </Pill>
      {to && (
        <>
          <ArrowRightOutlined />
          <Pill type={getType(to)} size="large" style={{ marginLeft: 0 }}>
            {tradingTypeMap[to]}
          </Pill>
        </>
      )}
    </SystemMessage>
  );
};

type OperatingProtocolsProps = { protocol: SelectedProtocol };

export const OperatingProtocols = ({ protocol }: OperatingProtocolsProps) => {
  return (
    <SystemMessage label="Operating protocols excluded:">
      <Pill size="large" style={{ marginLeft: 0, paddingRight: 16 }}>
        <img
          src={protocolImageMap[protocol]}
          alt={protocol}
          style={{ width: 18, height: 18 }}
        />
        {protocolMap[protocol]}
      </Pill>
    </SystemMessage>
  );
};
