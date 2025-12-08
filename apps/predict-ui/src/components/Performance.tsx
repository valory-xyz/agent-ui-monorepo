import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

import { CURRENCY, CurrencyCode } from '../constants/currency';
import { AgentMetricsResponse } from '../types';
import { Card } from './ui/Card';

const { Text, Title } = Typography;

const getValue = (value: number, currency: CurrencyCode) => {
  return `${CURRENCY[currency]?.symbol || '$'}${value || 0} `;
};

export const AgentPerformance = ({ performance }: { performance: AgentMetricsResponse }) => {
  const { metrics, stats, currency } = performance;
  const performanceItems = useMemo(
    () => [
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
        value: stats.prediction_accuracy
          ? `${(stats.prediction_accuracy * 100).toFixed(2)}%`
          : '0%',
      },
    ],
    [metrics, stats, currency],
  );

  return (
    <Card>
      <Row gutter={[24, 16]} align="middle" className="m-0">
        {performanceItems.map((item) => (
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
              <Title level={3} className="m-0 font-normal">
                {item.value}
              </Title>
            </Flex>
          </Col>
        ))}
      </Row>
    </Card>
  );
};
