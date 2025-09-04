import { ArrowRightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { CSSProperties, ReactNode, useCallback } from 'react';

import { TRADING_TYPE_MAP } from '../../constants/textMaps';
import { TradingType } from '../../types';
import { Pill } from '../ui/Pill';
import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';

const { Text } = Typography;

const SystemContainerStyles: CSSProperties = {
  width: '100%',
  marginTop: 0,
  padding: '8px 16px',
  backgroundColor: GLOBAL_COLORS.lightGrey,
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
    <Flex gap={type === 'strategy' ? 12 : 8} wrap="wrap">
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
    return undefined;
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
