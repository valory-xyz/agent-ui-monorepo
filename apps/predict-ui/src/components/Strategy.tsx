import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Skeleton, Tooltip, Typography } from 'antd';
import { NA } from '@agent-ui-monorepo/util-constants-and-types';

import { TRADING_TYPE_MAP } from '../constants/textMaps';
import { Pill } from './ui/Pill';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { Card } from './ui/Card';

const { Title } = Typography;

const TradingStrategyTitle = () => (
  <Title level={5} style={{ margin: 0 }} type="secondary">
    Trading strategy
    <Tooltip title="The set of rules the agent follows to decide how much to bet on a market. A strategy can consider different types of information (like confidence in an outcome, market profitability or other signals) to guide its decisions.">
      <InfoCircleOutlined style={{ marginLeft: 6 }} />
    </Tooltip>
  </Title>
);

const Loader = () => <Skeleton.Input style={{ width: 100 }} active size="small" />;

const StrategyContent = () => {
  const { isLoading, data } = useAgentDetails();
  const type = data?.agentInfo?.trading_type;

  return (
    <Flex justify="space-between" align="self-start">
      <TradingStrategyTitle />

      {isLoading ? (
        <Loader />
      ) : !type ? (
        NA
      ) : (
        <Pill type={type === 'risky' ? 'danger' : 'primary'} size="large" style={{ marginLeft: 0 }}>
          {TRADING_TYPE_MAP[type]}
        </Pill>
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
