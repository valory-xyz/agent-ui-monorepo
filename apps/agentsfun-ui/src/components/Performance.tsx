import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Spin, Tooltip, Typography } from 'antd';

import { usePerformance } from '../hooks/usePerformance';
import { Card } from './ui/Card';

const { Title, Text } = Typography;

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
    <path
      fill="#2F54EB"
      d="M1.5 14.25v-12a.75.75 0 0 1 1.5 0v12a.75.75 0 0 0 .75.75h12a.75.75 0 0 1 0 1.5h-12a2.25 2.25 0 0 1-2.25-2.25m3.75-1.5V10.5a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 1-1.5 0m3.75 0v-9a.75.75 0 0 1 1.5 0v9a.75.75 0 0 1-1.5 0m3.75 0v-6a.75.75 0 0 1 1.5 0v6a.75.75 0 0 1-1.5 0"
    ></path>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
    <path
      fill="#2F54EB"
      d="M11.231 2.376a4.868 4.868 0 0 1 6.019 4.75c0 2.058-1.355 3.54-2.47 4.654l-.008.01-4.106 3.97a2.25 2.25 0 0 1-3.316.019l-4.121-3.99-.01-.009C2.142 10.701.836 9.284.755 7.317L.75 7.125a4.875 4.875 0 0 1 8.249-3.519c.62-.6 1.39-1.025 2.232-1.23M2.253 7.254c.053 1.322.927 2.365 2.027 3.466l4.123 3.99.037.04a.75.75 0 0 0 1.125-.008l.044-.046 4.12-3.985c1.13-1.132 2.021-2.213 2.021-3.586v-.004a3.368 3.368 0 0 0-5.883-2.254l-.013.014a1.17 1.17 0 0 1-.794.369L9 5.25a1.17 1.17 0 0 1-.854-.37l-.01-.012A3.375 3.375 0 0 0 2.25 7.125z"
    ></path>
  </svg>
);

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
  const { isLoading, totalImpressions, totalLikes, impressionsTooltip, likesTooltip } =
    usePerformance();

  if (isLoading) return <Loader />;
  return (
    <Card>
      <Flex vertical gap={24} style={{ width: '100%' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <MetricCard
              icon={<ChartIcon />}
              label="Total Impressions"
              value={totalImpressions}
              tooltip={impressionsTooltip}
            />
          </Col>
          <Col xs={24} sm={12}>
            <MetricCard
              icon={<HeartIcon />}
              label="Total Likes"
              value={totalLikes}
              tooltip={likesTooltip}
            />
          </Col>
        </Row>
      </Flex>
    </Card>
  );
};
