import { Col, Flex, Row, Typography } from 'antd';

import { CURRENCY, CurrencyCode } from '../constants/currency';
import { useAgentPerformance } from '../hooks/useAgentPerformance';
import { Card } from './ui/Card';

const { Text, Title } = Typography;

const getValue = (value: number, currency: CurrencyCode) => {
  return `${CURRENCY[currency]?.symbol || '$'}${value || 0} `;
};

type AgentDetailsProps = {
  createdAt?: string;
  lastActiveAt?: string;
};

export const AgentPerformance = () => {
  const { data } = useAgentPerformance();
  if (!data) return null;

  const { metrics, stats, currency } = data;
  const fundsUsed = getValue(metrics.all_time_funds_used || 0, currency);
  const allTimeProfit = getValue(metrics.all_time_profit || 0, currency);

  return (
    <Card $padding="16px 32px">
      <Row gutter={24} align="middle" justify="space-between" className="m-0">
        <Col lg={12} sm={12} xs={24} className="p-0">
          <Flex gap={8} vertical>
            <Text type="secondary">All time funds used:</Text>
            <Title level={3} className="m-0">
              {fundsUsed}
            </Title>
          </Flex>
        </Col>
        <Col lg={12} sm={12} xs={24} className="p-0">
          <Flex gap={8} vertical>
            <Text type="secondary">All time profit:</Text>
            <Title level={3} className="m-0">
              {allTimeProfit}
            </Title>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};
