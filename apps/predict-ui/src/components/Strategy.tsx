import { Pill } from '@agent-ui-monorepo/ui-pill';
import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Skeleton, Tooltip, Typography } from 'antd';

import { TRADING_TYPE_MAP } from '../constants/textMaps';
import { COLOR } from '../constants/theme';
import { useTradingDetails } from '../hooks/useTradingDetails';
import { Card } from './ui/Card';

const { Title } = Typography;

const TradingStrategyTitle = () => (
  <Flex align="center" gap={6}>
    <Title level={5} type="secondary" style={{ margin: 0 }} className="font-normal">
      Trading strategy
    </Title>
    <Tooltip title="The set of rules the agent follows to decide how much to bet on a market. A strategy can consider different types of information (like confidence in an outcome, market profitability or other signals) to guide its decisions.">
      <InfoCircleOutlined style={{ color: COLOR.SECONDARY }} />
    </Tooltip>
  </Flex>
);

const Loader = () => <Skeleton.Input style={{ width: 100 }} active size="small" />;

const StrategyContent = () => {
  const { isLoading, data } = useTradingDetails();
  const type = data?.trading_type;

  return (
    <Flex justify="space-between" align="self-start">
      <TradingStrategyTitle />

      {isLoading ? (
        <Loader />
      ) : type ? (
        <Pill type={TRADING_TYPE_MAP[type].type} size="large" style={{ fontSize: 14 }}>
          {TRADING_TYPE_MAP[type].displayName}
        </Pill>
      ) : (
        NA
      )}
    </Flex>
  );
};

/**
 * Trading strategy
 */
export const Strategy = () => (
  <Card $padding="24px 32px">
    <StrategyContent />
  </Card>
);
