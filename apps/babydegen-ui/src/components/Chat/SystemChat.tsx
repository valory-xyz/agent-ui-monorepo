import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { CSSProperties, ReactNode, useCallback } from 'react';

import { COLOR } from '../../constants/colors';
import { PROTOCOLS_MAP, TRADING_TYPE_MAP } from '../../constants/textMaps';
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

type SystemMessageProps = {
  type?: 'strategy' | 'protocols';
  label: string;
  width?: number;
  children: ReactNode;
};

const SystemMessage = ({ type, label, children }: SystemMessageProps) => (
  <Flex align="center" gap={12} style={SystemContainerStyles}>
    <Text type="secondary" style={{ width: type === 'strategy' ? 174 : 200, flex: 'none' }}>
      {label}
    </Text>
    <Flex gap={type === 'strategy' ? 12 : 8} wrap="wrap" align="center">
      {children}
    </Flex>
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
  }, []);

  return (
    <SystemMessage label="Trading strategy updated:" type="strategy">
      <Pill type={getType(from)} size="large" style={{ marginLeft: 0 }}>
        {TRADING_TYPE_MAP[from]}
      </Pill>
      {to && (
        <>
          <ArrowRightOutlined />
          <Pill type={getType(to)} size="large" style={{ marginLeft: 0 }}>
            {TRADING_TYPE_MAP[to]}
          </Pill>
        </>
      )}
    </SystemMessage>
  );
};

type OperatingProtocolsProps = { protocols: SelectedProtocol[] };

/**
 * Operating protocols update message.
 */
export const OperatingProtocols = ({ protocols }: OperatingProtocolsProps) => (
  <SystemMessage label="Operating protocols updated:" type="protocols">
    {protocols.length === 0
      ? NA
      : protocols.map((protocol) => (
          <Pill size="large" key={protocol} style={{ marginLeft: 0, paddingRight: 16 }}>
            <img
              src={PROTOCOLS_MAP[protocol].logo}
              alt={protocol}
              style={{ width: 18, height: 18 }}
            />
            {PROTOCOLS_MAP[protocol].name}
          </Pill>
        ))}
  </SystemMessage>
);
