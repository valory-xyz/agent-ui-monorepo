import { ArrowRightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import React, { CSSProperties, ReactNode, useCallback } from 'react';

import { COLOR } from '../../constants/colors';
import { NA } from '../../constants/common';
import {
  protocolImageMap,
  protocolMap,
  tradingTypeMap,
} from '../../constants/textMaps';
import { SelectedProtocol, TradingType } from '../../types';
import { Pill } from '../../ui/Pill';

const { Text } = Typography;

const SystemContainerStyles: CSSProperties = {
  width: '100%',
  marginTop: 0,
  padding: '8px 16px',
  backgroundColor: COLOR.lightGrey,
  borderRadius: 8,
};

type SystemMessageProps = { label: string; children: ReactNode };

const SystemMessage = ({ label, children }: SystemMessageProps) => (
  <Flex align="center" gap={12} style={SystemContainerStyles}>
    <Text type="secondary">{label}</Text>
    {children}
  </Flex>
);

type TradingStrategyProps = { from: TradingType; to: TradingType };

/**
 * Trading strategy update message.
 */
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

type OperatingProtocolsProps = { protocols: SelectedProtocol[] };

/**
 * Operating protocols exclusion message.
 */
export const OperatingProtocols = ({ protocols }: OperatingProtocolsProps) => (
  <SystemMessage label="Operating protocols excluded:">
    {protocols.length === 0
      ? NA
      : protocols.map((protocol) => (
          <Pill
            size="large"
            key={protocol}
            style={{ marginLeft: 0, paddingRight: 16 }}
          >
            <img
              src={protocolImageMap[protocol]}
              alt={protocol}
              style={{ width: 18, height: 18 }}
            />
            {protocolMap[protocol]}
          </Pill>
        ))}
  </SystemMessage>
);
