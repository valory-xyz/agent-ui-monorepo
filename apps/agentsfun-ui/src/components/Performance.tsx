import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Spin, Tooltip, Typography } from 'antd';

import { usePerformance } from '../hooks/usePerformance';
import { Chart, Heart } from './svgs';
import { Card } from './ui/Card';

const { Title, Text } = Typography;

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  tooltip?: string;
};

const MetricCard = ({ icon, label, value, tooltip }: MetricCardProps) => (
  <Flex vertical gap={12}>
    <Flex align="center" gap={6}>
      <Text type="secondary">{label}</Text>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined style={{ fontSize: 14, color: '#8c8c8c' }} />
        </Tooltip>
      )}
    </Flex>

    <Flex align="center" gap={12}>
      <Flex style={{ padding: 6, background: 'rgba(47, 84, 235, 0.10)', borderRadius: 6 }}>
        {icon}
      </Flex>
      <Title level={3} className="m-0">
        {value.toLocaleString()}
      </Title>
    </Flex>
  </Flex>
);

const Loader = () => (
  <Card>
    <Flex justify="center" align="center" style={{ height: 64, width: '100%' }}>
      <Spin />
    </Flex>
  </Card>
);

export const Performance = () => {
  const { isLoading, weeklyImpressions, weeklyLikes, impressionsTooltip, likesTooltip } =
    usePerformance();

  if (isLoading) return <Loader />;
  return (
    <Card>
      <Flex vertical gap={24} style={{ width: '100%' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <MetricCard
              icon={<Chart />}
              label="Weekly Impressions"
              value={weeklyImpressions}
              tooltip={impressionsTooltip}
            />
          </Col>
          <Col xs={24} sm={12}>
            <MetricCard
              icon={<Heart />}
              label="Weekly Likes"
              value={weeklyLikes}
              tooltip={likesTooltip}
            />
          </Col>
        </Row>
      </Flex>
    </Card>
  );
};
