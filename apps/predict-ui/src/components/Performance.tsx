import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Tooltip, Typography } from 'antd';

import { CURRENCY, CurrencyCode } from '../constants/currency';
import { useAgentPerformance } from '../hooks/useAgentPerformance';
import { Card } from './ui/Card';

const { Text, Title } = Typography;

const getValue = (value: number, currency: CurrencyCode) => {
  return `${CURRENCY[currency]?.symbol || '$'}${value || 0} `;
};

export const AgentPerformance = () => {
  const { data } = useAgentPerformance();
  if (!data) return null;

  const { metrics, stats, currency } = data;

  const performance = [
    {
      title: 'All time funds used',
      value: getValue(metrics.all_time_funds_used || 0, currency),
      tooltip: 'Total funds used by the agent over its lifetime',
    },
    {
      title: 'All time profit',
      value: getValue(metrics.all_time_profit || 0, currency),
      tooltip:
        'The total net profit your agent has generated across all bets. With your All-time funds used, this gives an ROI of XX%.',
    },
    {
      title: 'Funds locked in markets',
      value: getValue(metrics.funds_locked_in_markets || 0, currency),
      tooltip: 'Total funds placed on prediction markets that haven’t resolved yet.',
    },
    {
      title: 'Available funds',
      value: getValue(metrics.available_funds || 0, currency),
      tooltip: 'Funds currently available for your agent to place new bets.',
    },
    {
      title: 'Predictions made',
      value: stats.predictions_made
        ? Intl.NumberFormat('en-US', {}).format(stats.predictions_made)
        : '0',
    },
    {
      title: 'Prediction accuracy',
      value: stats.prediction_accuracy ? `${(stats.prediction_accuracy * 100).toFixed(2)}%` : '0%',
    },
  ];

  return (
    <Card $padding="16px 32px">
      <Row gutter={[24, 16]} align="middle" className="m-0">
        {performance.map((item) => (
          <Col lg={12} sm={12} xs={24} className="p-0" key={item.title}>
            <Flex gap={8} vertical>
              <Text type="secondary">
                {item.title}
                {item.tooltip && (
                  <Tooltip title={item.tooltip}>
                    <InfoCircleOutlined className="ml-8" />
                  </Tooltip>
                )}
              </Text>
              <Title level={3} className="m-0">
                {item.value}
              </Title>
            </Flex>
          </Col>
        ))}
      </Row>
    </Card>
  );
};
