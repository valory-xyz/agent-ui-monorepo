import { Pill } from '@agent-ui-monorepo/ui-pill';
import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';

import { TRADING_TYPE_MAP } from '../../constants/textMaps';
import { TradingType } from '../../types';

const { Text } = Typography;

const pillStyle: CSSProperties = { fontSize: 14, marginLeft: 0, lineHeight: 'normal' };

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
    <Flex gap={12} wrap="wrap" align="center">
      {children}
    </Flex>
  </SystemContainer>
);

type TradingStrategyProps = { from: TradingType; to: TradingType };

/**
 * Trading strategy update message.
 */
export const TradingStrategy = ({ from, to }: TradingStrategyProps) => {
  return (
    <SystemMessage label="Trading strategy updated:">
      <Pill size="large" style={pillStyle}>
        {TRADING_TYPE_MAP[from].displayName}
      </Pill>
      {to && (
        <>
          <ArrowRightOutlined style={{ fontSize: 14, color: GLOBAL_COLORS.WHITE_TRANSPARENT_50 }} />
          <Pill type={TRADING_TYPE_MAP[to].type} size="large" style={pillStyle}>
            {TRADING_TYPE_MAP[to].displayName}
          </Pill>
        </>
      )}
    </SystemMessage>
  );
};
