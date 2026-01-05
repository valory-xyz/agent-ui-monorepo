import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Skeleton, Tooltip, Typography } from 'antd';
import styled from 'styled-components';

import { TRADING_TYPE_MAP } from '../constants/textMaps';
import { COLOR } from '../constants/theme';
import { useTradingDetails } from '../hooks/useTradingDetails';
import { Card } from './ui/Card';

const { Title, Paragraph, Text } = Typography;

const StrategyBody = styled.div`
  padding: 16px;
  border-radius: 10px;
  background: ${COLOR.WHITE_TRANSPARENT_5};
  .ant-skeleton-paragraph {
    margin-bottom: 0;
    margin-block-start: 16px !important;
  }
`;

const StrategyHeader = () => (
  <Flex align="center" gap={8}>
    <Title level={5} type="secondary" style={{ margin: 0 }} className="font-normal">
      Betting strategy
    </Title>
    <Tooltip title="The set of rules the agent follows to decide how much to bet on a market. A strategy can consider different types of information (like confidence in an outcome, market profitability or other signals) to guide its decisions.">
      <InfoCircleOutlined style={{ color: COLOR.SECONDARY }} />
    </Tooltip>
  </Flex>
);

const StrategyContent = () => {
  const { isLoading, data } = useTradingDetails();
  const type = data?.trading_type;
  const strategy = type ? TRADING_TYPE_MAP[type] : null;

  return (
    <Flex vertical gap={12}>
      <StrategyHeader />

      <StrategyBody>
        {isLoading ? (
          <Skeleton active title={{ width: '30%' }} paragraph={{ rows: 1 }} />
        ) : strategy ? (
          <>
            <Title level={4} className="m-0 font-normal">
              {strategy.displayName}
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: COLOR.WHITE_TRANSPARENT_75 }}>
              {strategy.description}
            </Paragraph>
          </>
        ) : (
          <Text type="secondary">{NA}</Text>
        )}
      </StrategyBody>
    </Flex>
  );
};

/**
 * Betting strategy overview card.
 */
export const Strategy = () => (
  <Card $padding="24px 32px">
    <StrategyContent />
  </Card>
);
