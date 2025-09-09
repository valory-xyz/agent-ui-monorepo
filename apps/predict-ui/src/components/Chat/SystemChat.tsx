import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';

import { TRADING_TYPE_MAP } from '../../constants/textMaps';
import { TradingType } from '../../types';
import { Pill } from '../ui/Pill';

const { Text } = Typography;

const SystemContainer = styled(Flex)`
  width: 100%;
  margin-top: 0;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${GLOBAL_COLORS.WHITE_TRANSPARENT_10};
  backdrop-filter: blur(10px);
  .ant-typography {
    flex: none;
    font-size: 14px;
  }
`;

type SystemMessageProps = {
  label: string;
  width?: number;
  children: ReactNode;
};

const SystemMessage = ({ label, children }: SystemMessageProps) => (
  <SystemContainer align="center" gap={16}>
    <Text type="secondary">{label}</Text>
    <Flex gap={12} wrap="wrap">
      {children}
    </Flex>
  </SystemContainer>
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
    <SystemMessage label="Trading strategy updated:">
      <Pill type={getType(from)} size="large" style={{ marginLeft: 0, fontSize: 14 }}>
        {TRADING_TYPE_MAP[from]}
      </Pill>
      {to && (
        <>
          <ArrowRightOutlined style={{ fontSize: 14, color: GLOBAL_COLORS.WHITE_TRANSPARENT_50 }} />
          <Pill type={getType(to)} size="large" style={{ marginLeft: 0 }}>
            {TRADING_TYPE_MAP[to]}
          </Pill>
        </>
      )}
    </SystemMessage>
  );
};
