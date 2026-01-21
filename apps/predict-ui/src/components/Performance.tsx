import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

import { CURRENCY, CurrencyCode } from '../constants/currency';
import { COLOR } from '../constants/theme';
import { AgentMetricsResponse } from '../types';
import { isTraderAgent } from '../utils/agentMap';
import { Card } from './ui/Card';

const { Text, Title } = Typography;

type PerformanceItem = {
  title: string;
  value: string;
  tooltip?: string;
  variant?: 'text' | 'title';
};

const getValue = (value: number, currency: CurrencyCode) => {
  return `${CURRENCY[currency]?.symbol || '$'}${value || 0} `;
};

const isPerformanceItem = (item: PerformanceItem | null): item is PerformanceItem => item !== null;

export const AgentPerformance = ({ performance }: { performance: AgentMetricsResponse }) => {
  const { metrics, stats, currency } = performance;

  const performanceItems = useMemo<PerformanceItem[]>(() => {
    const items: Array<PerformanceItem | null> = [
      {
        title: 'All time funds used',
        value: getValue(metrics.all_time_funds_used || 0, currency),
        tooltip: 'Total funds your agent has allocated to prediction-market bets over time.',
      },
      isTraderAgent
        ? {
            title: 'All time profit',
            value: getValue(metrics.all_time_profit || 0, currency),
            tooltip: `The total net profit your agent has generated across all bets. With your All-time funds used, this gives an ROI of ${((metrics.roi ?? 0) * 100).toFixed(2)}%.`,
          }
        : null,
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
          ? Intl.NumberFormat('en-US').format(stats.predictions_made)
          : '0',
      },
      isTraderAgent
        ? {
            title: 'Prediction accuracy',
            value:
              stats.prediction_accuracy === null
                ? 'Will appear with the first resolved market.'
                : `${(stats.prediction_accuracy * 100).toFixed(2)}%`,
            variant: stats.prediction_accuracy === null ? 'text' : 'title',
          }
        : null,
    ];

    return items.filter(isPerformanceItem);
  }, [metrics, stats, currency]);

  return (
    <Card>
      <Title level={4} className="m-0 font-normal">
        Performance
      </Title>

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
              {item.variant === 'text' ? (
                <Text className="text-sm" style={{ color: COLOR.WHITE_TRANSPARENT_75 }}>
                  {item.value}
                </Text>
              ) : (
                <Title level={3} className="m-0 font-normal">
                  {item.value}
                </Title>
              )}
            </Flex>
          </Col>
        ))}
      </Row>
    </Card>
  );
};
